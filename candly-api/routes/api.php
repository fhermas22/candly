<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ProfileMediaController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->middleware('throttle:10,1')->group(function (): void {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// Job advertisements (public for viewing open jobs).
Route::get('jobs', [JobController::class, 'index']);
Route::get('jobs/{jobId}', [JobController::class, 'show']);

Route::middleware('auth:sanctum')->group(function (): void {
    // Candidate endpoints.
    Route::get('candidate/applications', [ApplicationController::class, 'myActive']);
    Route::post('candidate/applications', [ApplicationController::class, 'apply']);
    Route::delete('candidate/applications/{applicationId}', [ApplicationController::class, 'withdraw']);

    // Admin endpoints.
    Route::middleware('role:admin')->group(function (): void {
        Route::get('admin/applications/pending', [ApplicationController::class, 'pendingForAdmin']);
        Route::patch('admin/applications/{applicationId}/moderate', [ApplicationController::class, 'moderate']);

        // Job management.
        Route::get('admin/jobs', [JobController::class, 'adminIndex']);
        Route::post('admin/jobs', [JobController::class, 'store']);
        Route::put('admin/jobs/{jobId}', [JobController::class, 'update']);
        Route::patch('admin/jobs/{jobId}/close', [JobController::class, 'close']);
        Route::patch('admin/jobs/{jobId}/reopen', [JobController::class, 'reopen']);
        Route::delete('admin/jobs/{jobId}', [JobController::class, 'destroy']);
    });

    Route::post('profile/media', [ProfileController::class, 'uploadMedia']);
});

// Signed media endpoints (no direct storage exposure).
Route::get('profiles/{profile}/cv', [ProfileMediaController::class, 'cv'])->name('profiles.cv');

