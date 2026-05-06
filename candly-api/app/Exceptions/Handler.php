<?php

declare(strict_types=1);

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * Register application exception mappings.
     */
    public function register(): void
    {
        // Business rule mapping: return a 422 for domain validation errors.
        $this->renderable(function (DuplicateApplicationException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        });

        $this->renderable(function (JobClosedException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        });

        $this->renderable(function (InvalidStatusException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        });

        // Business rule mapping: a 403 indicates a forbidden state transition.
        $this->renderable(function (ApplicationAlreadyModeratedEx $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        });
    }
}

