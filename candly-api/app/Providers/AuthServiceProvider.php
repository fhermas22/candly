<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\Application;
use App\Models\User;
use App\Policies\ApplicationPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // Register all policies explicitly for clarity and security.
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Application::class, ApplicationPolicy::class);
    }
}

