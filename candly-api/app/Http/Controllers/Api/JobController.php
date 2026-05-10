<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateJobRequest;
use App\Http\Requests\UpdateJobRequest;
use App\Http\Resources\JobResource;
use App\Models\JobAdvertisement;
use App\Repositories\JobAdvertisementRepository;
use App\Services\JobAdvertisementService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class JobController extends Controller
{
    public function __construct(
        private readonly JobAdvertisementRepository $jobs,
        private readonly JobAdvertisementService $service,
    ) {
    }

    /**
     * List open job advertisements (public).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $jobs = $this->jobs->getOpenJobs();

        return JobResource::collection($jobs);
    }

    /**
     * Show a specific job advertisement.
     */
    public function show(Request $request, int $jobId): JsonResponse
    {
        $job = $this->jobs->findById($jobId);

        if (! $job) {
            return response()->json(['message' => 'Job not found'], 404);
        }

        if (! Gate::allows('view', $job)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json(new JobResource($job));
    }

    /**
     * Create a new job advertisement (admin only).
     */
    public function store(CreateJobRequest $request): JsonResponse
    {
        $user = $request->user();
        if (! $user || $user->role !== 'admin') {
            throw new AuthorizationException();
        }

        $job = $this->service->create($request->validated(), (int) $user->id);

        return response()->json(new JobResource($job), 201);
    }

    /**
     * Update a job advertisement (admin only).
     */
    public function update(UpdateJobRequest $request, int $jobId): JsonResponse
    {
        $job = JobAdvertisement::findOrFail($jobId);

        if (! Gate::allows('update', $job)) {
            throw new AuthorizationException();
        }

        $job = $this->service->update($job, $request->validated());

        return response()->json(new JobResource($job));
    }

    /**
     * Close a job advertisement (admin only).
     */
    public function close(Request $request, int $jobId): JsonResponse
    {
        $job = JobAdvertisement::findOrFail($jobId);

        if (! Gate::allows('toggleStatus', $job)) {
            throw new AuthorizationException();
        }

        $job = $this->service->close($job);

        return response()->json(new JobResource($job));
    }

    /**
     * Reopen a job advertisement (admin only).
     */
    public function reopen(Request $request, int $jobId): JsonResponse
    {
        $job = JobAdvertisement::findOrFail($jobId);

        if (! Gate::allows('toggleStatus', $job)) {
            throw new AuthorizationException();
        }

        $job = $this->service->reopen($job);

        return response()->json(new JobResource($job));
    }

    /**
     * Delete a job advertisement (admin only).
     */
    public function destroy(Request $request, int $jobId): JsonResponse
    {
        $job = JobAdvertisement::findOrFail($jobId);

        if (! Gate::allows('delete', $job)) {
            throw new AuthorizationException();
        }

        $this->service->delete($job);

        return response()->json(null, 204);
    }

    /**
     * List all job advertisements for admin management.
     */
    public function adminIndex(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        if (! $user || $user->role !== 'admin') {
            throw new AuthorizationException();
        }

        $paginator = $this->jobs->getAllForAdmin();

        return JobResource::collection($paginator);
    }
}
