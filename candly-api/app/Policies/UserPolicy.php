<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Business rule: a user can only delete their own account.
     */
    public function deleteOwnAccount(User $user, User $target): bool
    {
        return (int) $user->id === (int) $target->id;
    }

    /**
     * Business rule: only admins can list users.
     */
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }
}

