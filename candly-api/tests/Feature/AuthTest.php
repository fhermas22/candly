<?php

declare(strict_types=1);

use App\Models\User;
// ─────────────────────────────────────────────────────────────────────────────
// REGISTER — POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
describe('Register — POST /api/auth/register', function () {
    it('create a candidate account with valid data', function () {
        $response = $this->postJson('/api/auth/register', [
            'email' => 'jean.martin@exemple.com',
            'password' => 'MotDePasse123!',
            'password_confirmation' => 'MotDePasse123!',
            'first_name' => 'Jean',
            'last_name' => 'Martin',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => 'jean.martin@exemple.com',
            'role' => 'candidate',
        ]);
        $response->assertJsonStructure([
            'user' => ['id', 'email'],
            'plainTextToken',
        ]);
    });

    it('returns an error if the email is already used', function () {
        User::factory()->create(['email' => 'existant@exemple.com']);

        $response = $this->postJson('/api/auth/register', [
            'email' => 'existant@exemple.com',
            'password' => 'MotDePasse123!',
            'password_confirmation' => 'MotDePasse123!',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    });

    it('returns an error if the passwords do not match', function () {
        $response = $this->postJson('/api/auth/register', [
            'email' => 'jean@exemple.com',
            'password' => 'MotDePasse123!',
            'password_confirmation' => 'AutreMot123!',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    });

    it('returns an error if the password is too short', function () {
        $response = $this->postJson('/api/auth/register', [
            'email' => 'jean@exemple.com',
            'password' => 'court',
            'password_confirmation' => 'court',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    });

    it('returns an error if the email is missing', function () {
        $response = $this->postJson('/api/auth/register', [
            'password' => 'MotDePasse123!',
            'password_confirmation' => 'MotDePasse123!',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    });

    it('returns an error if the email is invalid', function () {
        $response = $this->postJson('/api/auth/register', [
            'email' => 'pasun-email',
            'password' => 'MotDePasse123!',
            'password_confirmation' => 'MotDePasse123!',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    });
});


// ─────────────────────────────────────────────────────────────────────────────
// LOGIN — POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
describe('Login — POST /api/auth/login', function () {
    it('connects a user with the correct credentials', function () {
        User::factory()->create([
            'email' => 'marie@exemple.com',
            'password' => 'MotDePasse123!',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'marie@exemple.com',
            'password' => 'MotDePasse123!',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'user' => ['id', 'email'],
            'plainTextToken',
        ]);
    });

    it('rejects connection with an incorrect password', function () {
        User::factory()->create([
            'email' => 'marie@exemple.com',
            'password' => 'MotDePasse123!',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'marie@exemple.com',
            'password' => 'mauvaisMotDePasse',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    });

    it('rejects connection if email is unknown', function () {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'inconnu@exemple.com',
            'password' => 'MotDePasse123!',
        ]);

        $response->assertStatus(422);
    });

    it('rejects connection if the fields are empty', function () {
        $response = $this->postJson('/api/auth/login', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email', 'password']);
    });
});
