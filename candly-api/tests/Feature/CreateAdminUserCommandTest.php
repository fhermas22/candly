<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

it('asks for the admin password on interactive runs', function () {
    $email = 'admin@example.com';

    $this->artisan('candly:create-admin-user', ['email' => $email, '--status' => 1])
        ->expectsQuestion('Admin password', 'secret123')
        ->assertSuccessful();

    $this->assertDatabaseHas('users', [
        'email' => $email,
        'role' => 'admin',
        'status' => true,
    ]);

    $user = User::query()->where('email', $email)->first();
    expect($user)->not->toBeNull();
    expect(Hash::check('secret123', $user->password))->toBeTrue();
});

it('uses CANDLY_ADMIN_PASSWORD in non-interactive automation', function () {
    putenv('CANDLY_ADMIN_PASSWORD=envSecret123');

    $email = 'admin-env@example.com';

    $this->artisan('candly:create-admin-user', ['email' => $email, '--status' => 1])
        ->assertSuccessful();

    $this->assertDatabaseHas('users', [
        'email' => $email,
        'role' => 'admin',
        'status' => true,
    ]);

    $user = User::query()->where('email', $email)->first();
    expect($user)->not->toBeNull();
    expect(Hash::check('envSecret123', $user->password))->toBeTrue();
});
