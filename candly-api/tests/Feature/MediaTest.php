<?php

declare(strict_types=1);

use App\Models\Profile;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

it('test_upload_valid_photo', function () {
    // Business rule: profile photo must be a valid image and stored under profiles/photos on the public disk.
    Storage::fake('public');
    Storage::fake('local');

    $user = User::factory()->create(['role' => 'candidate']);
    Profile::factory()->create(['user_id' => $user->id, 'first_name' => 'Jane', 'last_name' => 'Doe']);

    Sanctum::actingAs($user);

    $response = $this->post('/api/profile/media', [
        'photo' => UploadedFile::fake()->image('photo.jpg', 300, 300),
    ]);

    $response->assertStatus(200);

    $files = Storage::disk('public')->allFiles('profiles/photos');
    expect($files)->toHaveCount(1);
});

it('test_upload_oversized_cv_fails', function () {
    // Business rule: CV must be <= 5MB and should not be stored when validation fails.
    Storage::fake('public');
    Storage::fake('local');

    $user = User::factory()->create(['role' => 'candidate']);
    Profile::factory()->create(['user_id' => $user->id, 'first_name' => 'Jane', 'last_name' => 'Doe']);

    Sanctum::actingAs($user);

    $response = $this->post('/api/profile/media', [
        'cv' => UploadedFile::fake()->create('cv.pdf', 6000, 'application/pdf'), // size in KB
    ]);

    $response->assertStatus(422);

    expect(Storage::disk('local')->allFiles('profiles/cvs'))->toHaveCount(0);
});

it('test_upload_webp_photo_is_allowed', function () {
    Storage::fake('public');
    Storage::fake('local');

    $user = User::factory()->create(['role' => 'candidate']);
    Profile::factory()->create(['user_id' => $user->id, 'first_name' => 'Jane', 'last_name' => 'Doe']);

    Sanctum::actingAs($user);

    $response = $this->post('/api/profile/media', [
        'photo' => UploadedFile::fake()->image('photo.webp', 300, 300),
    ]);

    $response->assertStatus(200);
    expect(Storage::disk('public')->allFiles('profiles/photos'))->toHaveCount(1);
});

it('test_profile_details_can_be_updated', function () {
    $user = User::factory()->create(['role' => 'candidate']);
    $profile = Profile::factory()->create(['user_id' => $user->id, 'first_name' => 'Jane', 'last_name' => 'Doe']);

    Sanctum::actingAs($user);

    $response = $this->patch('/api/profile', [
        'first_name' => 'John',
        'last_name' => 'Smith',
        'title' => 'Senior Developer',
        'bio' => 'Crafting reliable products',
        'location' => 'Paris',
        'linkedin' => 'https://linkedin.com/in/johnsmith',
    ]);

    $response->assertStatus(200);
    $response->assertJsonPath('profile.first_name', 'John');
    $response->assertJsonPath('profile.last_name', 'Smith');
    $response->assertJsonPath('profile.title', 'Senior Developer');

    $profile->refresh();
    expect($profile->title)->toBe('Senior Developer');
    expect($profile->linkedin)->toBe('https://linkedin.com/in/johnsmith');
});

it('test_old_file_deleted_on_new_upload', function () {
    // Business rule: old media is deleted only after a successful DB commit (no orphaned files).
    Storage::fake('public');
    Storage::fake('local');

    $user = User::factory()->create(['role' => 'candidate']);
    Profile::factory()->create(['user_id' => $user->id, 'first_name' => 'Jane', 'last_name' => 'Doe']);

    Sanctum::actingAs($user);

    $this->post('/api/profile/media', [
        'photo' => UploadedFile::fake()->image('photo1.jpg', 300, 300),
    ])->assertStatus(200);

    $first = Storage::disk('public')->allFiles('profiles/photos');
    expect($first)->toHaveCount(1);

    $firstPath = $first[0];

    $this->post('/api/profile/media', [
        'photo' => UploadedFile::fake()->image('photo2.jpg', 300, 300),
    ])->assertStatus(200);

    expect(Storage::disk('public')->exists($firstPath))->toBeFalse();
    expect(Storage::disk('public')->allFiles('profiles/photos'))->toHaveCount(1);
});

