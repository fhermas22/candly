<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Application;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ApplicationRepository
{
    /**
     * Fetch non-deleted applications for a given candidate.
     *
     * @return Collection<int, Application>
     */
    public function getActiveForCandidate(int $candidateId): Collection
    {
        return Application::query()
            ->where('user_id', $candidateId)
            ->whereNull('deleted_at')
            ->with([
                'jobAdvertisement',
                'moderatedBy',
            ])
            ->orderByDesc('applied_at')
            ->get();
    }

    /**
     * Fetch pending applications for admins review (paginated).
     */
    public function getPendingForAdmin(): LengthAwarePaginator
    {
        return Application::query()
            ->where('status', 'pending')
            ->whereNull('deleted_at')
            ->with([
                'user.profile',
                'jobAdvertisement',
            ])
            ->orderBy('applied_at')
            ->paginate(15);
    }
}

