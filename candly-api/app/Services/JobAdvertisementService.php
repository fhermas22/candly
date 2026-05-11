<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\JobAdvertisement;
use Illuminate\Database\Eloquent\Collection;

class JobAdvertisementService
{
    /**
     * Create a new job advertisement.
     *
     * @param array<string, mixed> $data
     */
    public function create(array $data, int $adminId): JobAdvertisement
    {
        return JobAdvertisement::query()->create([
            'admin_id' => $adminId,
            'title' => $data['title'],
            'location' => $data['location'],
            'description' => $data['description'],
            'salary_range' => $data['salary_range'] ?? null,
            'status' => 'open',
        ]);
    }

    /**
     * Update an existing job advertisement.
     *
     * @param array<string, mixed> $data
     */
    public function update(JobAdvertisement $job, array $data): JobAdvertisement
    {
        $job->update([
            'title' => $data['title'] ?? $job->title,
            'location' => $data['location'] ?? $job->location,
            'description' => $data['description'] ?? $job->description,
            'salary_range' => $data['salary_range'] ?? $job->salary_range,
        ]);

        return $job->fresh();
    }

    /**
     * Close a job advertisement.
     */
    public function close(JobAdvertisement $job): JobAdvertisement
    {
        $job->status = 'closed';
        $job->save();

        return $job;
    }

    /**
     * Reopen a job advertisement.
     */
    public function reopen(JobAdvertisement $job): JobAdvertisement
    {
        $job->status = 'open';
        $job->save();

        return $job;
    }

    /**
     * Delete a job advertisement.
     */
    public function delete(JobAdvertisement $job): void
    {
        $job->delete();
    }
}
