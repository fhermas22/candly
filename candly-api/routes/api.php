<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ProfileMediaController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->middleware('throttle:10,1')->group(function (): void {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function (): void {
    // Candidate endpoints.
    Route::get('candidate/applications', [ApplicationController::class, 'myActive']);
    Route::post('candidate/applications', [ApplicationController::class, 'apply']);
    Route::delete('candidate/applications/{applicationId}', [ApplicationController::class, 'withdraw']);

    // Admin endpoints.
    Route::middleware('role:admin')->group(function (): void {
        Route::get('admin/applications/pending', [ApplicationController::class, 'pendingForAdmin']);
        Route::patch('admin/applications/{applicationId}/moderate', [ApplicationController::class, 'moderate']);
    });

    Route::post('profile/media', [ProfileController::class, 'uploadMedia']);
});

// Signed media endpoints (no direct storage exposure).
Route::get('profiles/{profile}/cv', [ProfileMediaController::class, 'cv'])->name('profiles.cv');

