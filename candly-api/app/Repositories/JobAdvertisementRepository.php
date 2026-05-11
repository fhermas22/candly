<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\JobAdvertisement;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class JobAdvertisementRepository
{
    /**
     * Fetch all open job advertisements.
     *
     * @return Collection<int, JobAdvertisement>
     */
    public function getOpenJobs(): Collection
    {
        return JobAdvertisement::query()
            ->where('status', 'open')
            ->with('admin')
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Fetch paginated job advertisements for admin management.
     */
    public function getAllForAdmin(): LengthAwarePaginator
    {
        return JobAdvertisement::query()
            ->with('admin')
            ->orderByDesc('created_at')
            ->paginate(15);
    }

    /**
     * Find a job by ID.
     */
    public function findById(int $id): ?JobAdvertisement
    {
        return JobAdvertisement::query()
            ->with('admin')
            ->find($id);
    }
}
