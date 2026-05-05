<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ApplicationController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function (): void {
    // Candidate endpoints.
    Route::get('candidate/applications', [ApplicationController::class, 'myActive']);
    Route::post('candidate/applications', [ApplicationController::class, 'apply']);
    Route::delete('candidate/applications/{applicationId}', [ApplicationController::class, 'withdraw']);

    // Admin endpoints.
    Route::get('admin/applications/pending', [ApplicationController::class, 'pendingForAdmin']);
    Route::patch('admin/applications/{applicationId}/moderate', [ApplicationController::class, 'moderate']);
});

