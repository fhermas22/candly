<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ProfileMediaController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

// Health check endpoint for monitoring the API's health and database connectivity.
Route::get('/health', function () {
    $dbStatus = 'disconnected';
    $dbLatency = null;

    try {
        $start = microtime(true);
        DB::connection()->getPdo();
        $dbLatency = round((microtime(true) - $start) * 1000, 2);
        $dbStatus = 'connected';
    } catch (\Exception $e) {
        $dbStatus = 'error';
    }

    $isHealthy = $dbStatus === 'connected';

    return response()->json([
        'status'
        => $isHealthy ? 'ok' : 'degraded',
        'timestamp' => now()->toIso8601String(),
        'services' => [
            'database' => ['status' => $dbStatus, 'latency_ms' => $dbLatency],
        ],
    ], $isHealthy ? 200 : 503);
});

// Public endpoints (no authentication required).
Route::prefix('auth')->middleware('throttle:10,1')->group(function (): void {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// Job advertisements (public for viewing open jobs).
Route::get('jobs', [JobController::class, 'index']);
Route::get('jobs/{jobId}', [JobController::class, 'show']);

Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function (): void {

    // Candidate endpoints.
    Route::get('candidate/applications', [ApplicationController::class, 'myActive']);
    Route::post('candidate/applications', [ApplicationController::class, 'apply']);
    Route::delete('candidate/applications/{applicationId}', [ApplicationController::class, 'withdraw']);

    // Admin endpoints.
    Route::middleware([\App\Http\Middleware\EnsureUserIsAdmin::class])->group(function (): void {
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
    Route::patch('profile', [ProfileController::class, 'update']);
});

// Signed media endpoints
Route::get('profiles/{profile}/cv', [ProfileMediaController::class, 'cv'])->name('profiles.cv');
