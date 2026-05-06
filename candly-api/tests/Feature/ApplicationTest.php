<?php

declare(strict_types=1);

use App\Models\Application;
use App\Models\JobAdvertisement;
use App\Models\Profile;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('test_candidate_can_apply_to_open_job', function () {
    // Business rule: a candidate can apply to an open job and the application is persisted.
    $candidate = User::factory()->create(['role' => 'candidate']);
    Profile::factory()->create(['user_id' => $candidate->id, 'first_name' => 'Jane', 'last_name' => 'Doe']);
    $job = JobAdvertisement::factory()->create(['status' => 'open']);

    Sanctum::actingAs($candidate);

    $response = $this->postJson('/api/candidate/applications', [
        'job_id' => $job->id,
    ]);

    $response->assertStatus(201);

    $this->assertDatabaseHas('applications', [
        'user_id' => $candidate->id,
        'job_id' => $job->id,
        'status' => 'pending',
        'deleted_at' => null,
    ]);
});

it('test_candidate_cannot_apply_twice', function () {
    // Business rule: duplicate active applications are blocked (422).
    $candidate = User::factory()->create(['role' => 'candidate']);
    $job = JobAdvertisement::factory()->create(['status' => 'open']);

    Application::factory()->create([
        'user_id' => $candidate->id,
        'job_id' => $job->id,
        'status' => 'pending',
    ]);

    Sanctum::actingAs($candidate);

    $response = $this->postJson('/api/candidate/applications', [
        'job_id' => $job->id,
    ]);

    $response->assertStatus(422);
});

it('test_candidate_can_withdraw_own_application', function () {
    // Business rule: a candidate can withdraw (soft delete) their own pending application.
    $candidate = User::factory()->create(['role' => 'candidate']);
    $job = JobAdvertisement::factory()->create(['status' => 'open']);
    $application = Application::factory()->create([
        'user_id' => $candidate->id,
        'job_id' => $job->id,
        'status' => 'pending',
        'deleted_at' => null,
    ]);

    Sanctum::actingAs($candidate);

    $response = $this->deleteJson("/api/candidate/applications/{$application->id}");
    $response->assertStatus(204);

    $this->assertDatabaseHas('applications', [
        'id' => $application->id,
    ]);

    $this->assertNotNull(Application::withTrashed()->find($application->id)?->deleted_at);
});

it('test_candidate_cannot_withdraw_others_application', function () {
    // Business rule: candidates cannot withdraw applications they do not own (403).
    $owner = User::factory()->create(['role' => 'candidate']);
    $other = User::factory()->create(['role' => 'candidate']);
    $job = JobAdvertisement::factory()->create(['status' => 'open']);
    $application = Application::factory()->create([
        'user_id' => $owner->id,
        'job_id' => $job->id,
        'status' => 'pending',
        'deleted_at' => null,
    ]);

    Sanctum::actingAs($other);

    $response = $this->deleteJson("/api/candidate/applications/{$application->id}");
    $response->assertStatus(403);
});

it('test_admin_can_moderate_with_traceability', function () {
    // Business rule: moderation must record the admin id (moderated_by) for traceability.
    $admin = User::factory()->admin()->create();
    Profile::factory()->create(['user_id' => $admin->id, 'first_name' => 'Alice', 'last_name' => 'Admin']);

    $candidate = User::factory()->create(['role' => 'candidate']);
    $job = JobAdvertisement::factory()->create(['status' => 'open', 'admin_id' => $admin->id]);
    $application = Application::factory()->create([
        'user_id' => $candidate->id,
        'job_id' => $job->id,
        'status' => 'pending',
        'moderated_by' => null,
        'deleted_at' => null,
    ]);

    Sanctum::actingAs($admin);

    $response = $this->patchJson("/api/admin/applications/{$application->id}/moderate", [
        'status' => 'accepted',
    ]);

    $response->assertStatus(200);

    $this->assertDatabaseHas('applications', [
        'id' => $application->id,
        'status' => 'accepted',
        'moderated_by' => $admin->id,
    ]);
});

it('test_non_admin_cannot_moderate', function () {
    // Business rule: only admins can moderate; candidates receive a 403.
    $candidate = User::factory()->create(['role' => 'candidate']);
    $job = JobAdvertisement::factory()->create(['status' => 'open']);
    $application = Application::factory()->create([
        'user_id' => $candidate->id,
        'job_id' => $job->id,
        'status' => 'pending',
        'deleted_at' => null,
    ]);

    Sanctum::actingAs($candidate);

    $response = $this->patchJson("/api/admin/applications/{$application->id}/moderate", [
        'status' => 'accepted',
    ]);

    $response->assertStatus(403);
});

