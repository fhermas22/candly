<?php

declare(strict_types=1);

use App\Models\JobAdvertisement;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('guest aborts with 401 when accessing an admin route', function () {
    $job = JobAdvertisement::factory()->create();

    $response = $this->patchJson("/api/admin/jobs/{$job->id}/close", []);

    $response->assertStatus(401);
});

it('candidate aborts with 403 when accessing an admin route', function () {
    $candidate = User::factory()->create(['role' => 'candidate']);
    $job = JobAdvertisement::factory()->create(['status' => 'open']);

    Sanctum::actingAs($candidate);

    $response = $this->patchJson("/api/admin/jobs/{$job->id}/close", []);

    $response->assertStatus(403);
});

it('admin allows access to an admin route', function () {
    $admin = User::factory()->admin()->create();
    $job = JobAdvertisement::factory()->create(['status' => 'open', 'admin_id' => $admin->id]);

    Sanctum::actingAs($admin);

    $response = $this->patchJson("/api/admin/jobs/{$job->id}/close", []);

    $response->assertStatus(200);
});



