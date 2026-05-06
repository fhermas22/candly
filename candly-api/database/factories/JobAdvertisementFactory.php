<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\JobAdvertisement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JobAdvertisement>
 */
class JobAdvertisementFactory extends Factory
{
    protected $model = JobAdvertisement::class;

    public function definition(): array
    {
        return [
            'admin_id' => User::factory()->admin(),
            'title' => fake()->jobTitle(),
            'location' => fake()->city(),
            'description' => fake()->paragraphs(3, true),
            'salary_range' => fake()->optional()->randomElement(['30-40k', '40-55k', '55-70k']),
            'status' => 'open',
        ];
    }

    public function closed(): static
    {
        return $this->state(fn () => ['status' => 'closed']);
    }
}

