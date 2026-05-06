<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Application;
use App\Models\JobAdvertisement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Application>
 */
class ApplicationFactory extends Factory
{
    protected $model = Application::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'job_id' => JobAdvertisement::factory(),
            'status' => 'pending',
            'moderated_by' => null,
            'applied_at' => now(),
        ];
    }
}

