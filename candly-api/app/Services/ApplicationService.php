<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\ApplicationAlreadyModeratedEx;
use App\Exceptions\DuplicateApplicationException;
use App\Exceptions\InvalidStatusException;
use App\Exceptions\JobClosedException;
use App\Models\Application;
use App\Models\JobAdvertisement;
use Carbon\CarbonImmutable;

class ApplicationService
{
    /**
     * Business rule: prevent duplicate active applications and block closed jobs.
     */
    public function apply(int $candidateId, int $jobId): Application
    {
        // Guard 1 — Duplicate check: active (non-soft-deleted) application must be unique per candidate+job.
        $duplicateExists = Application::query()
            ->where('user_id', $candidateId)
            ->where('job_id', $jobId)
            ->whereNull('deleted_at')
            ->exists();

        if ($duplicateExists) {
            throw new DuplicateApplicationException();
        }

        // Guard 2 — Job status check: do not allow applications when a job is closed.
        $job = JobAdvertisement::query()->findOrFail($jobId);
        if ($job->status === 'closed') {
            throw new JobClosedException();
        }

        return Application::query()->create([
            'user_id' => $candidateId,
            'job_id' => $jobId,
            'status' => 'pending',
            'applied_at' => CarbonImmutable::now(),
        ]);
    }

    /**
     * Business rule: candidates can only withdraw their own pending applications.
     */
    public function withdraw(int $applicationId, int $candidateId): void
    {
        $application = Application::query()
            ->where('id', $applicationId)
            ->whereNull('deleted_at')
            ->firstOrFail();

        if ((int) $application->user_id !== $candidateId) {
            throw new ApplicationAlreadyModeratedEx('You are not allowed to withdraw this application.');
        }

        // Guard — Withdraw only while pending; once accepted/rejected the decision is final.
        if ($application->status !== 'pending') {
            throw new ApplicationAlreadyModeratedEx();
        }

        $application->delete();
    }

    /**
     * Business rule: only accept/reject and always record who moderated.
     */
    public function moderate(int $applicationId, int $adminId, string $newStatus): Application
    {
        if (! in_array($newStatus, ['accepted', 'rejected'], true)) {
            throw new InvalidStatusException();
        }

        $application = Application::query()
            ->where('id', $applicationId)
            ->whereNull('deleted_at')
            ->firstOrFail();

        $application->status = $newStatus;
        $application->moderated_by = $adminId;
        $application->save();

        return $application;
    }
}

