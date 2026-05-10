<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\JobAdvertisement;
use App\Models\User;

class JobAdvertisementPolicy
{
    /**
     * Anyone can view open jobs.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Anyone can view a specific job if it's open.
     */
    public function view(?User $user, JobAdvertisement $job): bool
    {
        return $job->status === 'open';
    }

    /**
     * Only admins can create jobs.
     */
    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Only admins can update jobs.
     */
    public function update(User $user, JobAdvertisement $job): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Only admins can delete jobs.
     */
    public function delete(User $user, JobAdvertisement $job): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Only admins can close/reopen jobs.
     */
    public function toggleStatus(User $user, JobAdvertisement $job): bool
    {
        return $user->role === 'admin';
    }
}
