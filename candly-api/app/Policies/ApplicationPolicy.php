<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Application;
use App\Models\User;

class ApplicationPolicy
{
    /**
     * Business rule: candidates can withdraw only their own pending applications.
     */
    public function withdraw(User $user, Application $application): bool
    {
        return (int) $user->id === (int) $application->user_id && $application->status === 'pending';
    }

    /**
     * Business rule: only admins can moderate applications (role-only check).
     */
    public function moderate(User $user): bool
    {
        return $user->role === 'admin';
    }
}

