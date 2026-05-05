<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Repositories\ApplicationRepository;
use App\Services\ApplicationService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ApplicationController extends Controller
{
    public function __construct(
        private readonly ApplicationRepository $applications,
        private readonly ApplicationService $service,
    ) {
    }

    /**
     * Candidate: list their active applications.
     */
    public function myActive(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        if (! $user || $user->role !== 'candidate') {
            throw new AuthorizationException();
        }

        $apps = $this->applications->getActiveForCandidate((int) $user->id);

        return ApplicationResource::collection($apps);
    }

    /**
     * Candidate: apply to a job advertisement.
     */
    public function apply(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user || $user->role !== 'candidate') {
            throw new AuthorizationException();
        }

        $validated = $request->validate([
            'job_id' => ['required', 'integer'],
        ]);

        $application = $this->service->apply((int) $user->id, (int) $validated['job_id'])
            ->load(['jobAdvertisement', 'moderatedBy.profile']);

        return response()->json(new ApplicationResource($application), 201);
    }

    /**
     * Candidate: withdraw a pending application (soft delete).
     */
    public function withdraw(Request $request, int $applicationId): JsonResponse
    {
        $user = $request->user();
        if (! $user || $user->role !== 'candidate') {
            throw new AuthorizationException();
        }

        $this->service->withdraw($applicationId, (int) $user->id);

        return response()->json(null, 204);
    }

    /**
     * Admin: list pending applications for moderation.
     */
    public function pendingForAdmin(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        if (! $user || $user->role !== 'admin') {
            throw new AuthorizationException();
        }

        $paginator = $this->applications->getPendingForAdmin();

        return ApplicationResource::collection($paginator);
    }

    /**
     * Admin: moderate an application (accept/reject).
     */
    public function moderate(Request $request, int $applicationId): JsonResponse
    {
        $user = $request->user();
        if (! $user || $user->role !== 'admin') {
            throw new AuthorizationException();
        }

        $validated = $request->validate([
            'status' => ['required', 'string'],
        ]);

        $application = $this->service
            ->moderate($applicationId, (int) $user->id, (string) $validated['status'])
            ->load(['jobAdvertisement', 'moderatedBy.profile']);

        return response()->json(new ApplicationResource($application));
    }
}

