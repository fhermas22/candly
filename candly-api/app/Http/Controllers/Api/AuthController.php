<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new candidate account and issue a Sanctum token.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
        ]);

        $user = User::query()->create([
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => 'candidate',
            'status' => true,
        ]);

        $user->profile()->create([
            'first_name' => $validated['first_name'] ?? '',
            'last_name' => $validated['last_name'] ?? '',
        ]);

        // Token generation: Sanctum stores a hashed token server-side and returns the plain value once.
        $token = $user->createToken('candly-api')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user->load('profile')),
            'plainTextToken' => $token,
        ], 201);
    }

    /**
     * Login using email/password and issue a new Sanctum token.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], (string) $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Token generation: each login can create a new token; client must store it securely.
        $token = $user->createToken('candly-api')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user->load('profile')),
            'plainTextToken' => $token,
        ]);
    }
}

