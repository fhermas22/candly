<?php

declare(strict_types=1);

use App\Models\JobAdvertisement;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('test_public_can_list_open_jobs', function () {
    JobAdvertisement::factory()->create(['status' => 'open', 'title' => 'Open Job']);
    JobAdvertisement::factory()->create(['status' => 'closed', 'title' => 'Closed Job']);

    $response = $this->getJson('/api/jobs');

    $response->assertStatus(200)
        ->assertJsonCount(1)
        ->assertJsonFragment(['title' => 'Open Job']);
});

it('test_public_can_view_open_job', function () {
    $job = JobAdvertisement::factory()->create(['status' => 'open']);

    $response = $this->getJson("/api/jobs/{$job->id}");

    $response->assertStatus(200)
        ->assertJsonFragment(['id' => $job->id]);
});

it('test_public_cannot_view_closed_job', function () {
    $job = JobAdvertisement::factory()->create(['status' => 'closed']);

    $response = $this->getJson("/api/jobs/{$job->id}");

    $response->assertStatus(403);
});

it('test_admin_can_create_job', function () {
    $admin = User::factory()->admin()->create();

    Sanctum::actingAs($admin);

    $data = [
        'title' => 'New Job',
        'location' => 'Remote',
        'description' => 'A great job',
        'salary_range' => '50-60k',
    ];

    $response = $this->postJson('/api/admin/jobs', $data);

    $response->assertStatus(201)
        ->assertJsonFragment($data);

    $this->assertDatabaseHas('job_advertisements', [
        'admin_id' => $admin->id,
        'title' => 'New Job',
        'status' => 'open',
    ]);
});

it('test_admin_can_update_job', function () {
    $admin = User::factory()->admin()->create();
    $job = JobAdvertisement::factory()->create(['admin_id' => $admin->id]);

    Sanctum::actingAs($admin);

    $data = ['title' => 'Updated Title'];

    $response = $this->putJson("/api/admin/jobs/{$job->id}", $data);

    $response->assertStatus(200)
        ->assertJsonFragment(['title' => 'Updated Title']);
});

it('test_admin_can_close_job', function () {
    $admin = User::factory()->admin()->create();
    $job = JobAdvertisement::factory()->create(['status' => 'open']);

    Sanctum::actingAs($admin);

    $response = $this->patchJson("/api/admin/jobs/{$job->id}/close");

    $response->assertStatus(200)
        ->assertJsonFragment(['status' => 'closed']);
});

it('test_admin_can_reopen_job', function () {
    $admin = User::factory()->admin()->create();
    $job = JobAdvertisement::factory()->create(['status' => 'closed']);

    Sanctum::actingAs($admin);

    $response = $this->patchJson("/api/admin/jobs/{$job->id}/reopen");

    $response->assertStatus(200)
        ->assertJsonFragment(['status' => 'open']);
});

it('test_admin_can_delete_job', function () {
    $admin = User::factory()->admin()->create();
    $job = JobAdvertisement::factory()->create();

    Sanctum::actingAs($admin);

    $response = $this->deleteJson("/api/admin/jobs/{$job->id}");

    $response->assertStatus(204);

    $this->assertDatabaseMissing('job_advertisements', ['id' => $job->id]);
});

it('test_candidate_cannot_create_job', function () {
    $candidate = User::factory()->create(['role' => 'candidate']);

    Sanctum::actingAs($candidate);

    $response = $this->postJson('/api/admin/jobs', [
        'title' => 'Job',
        'location' => 'Somewhere',
        'description' => 'Desc',
    ]);

    $response->assertStatus(403);
});
