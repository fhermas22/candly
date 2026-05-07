<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Enforce a required role on the authenticated user.
     *
     * Security note: unknown roles are treated as an anomaly and denied.
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $actualRole = (string) ($user->role ?? '');

        if (! in_array($actualRole, ['admin', 'candidate'], true)) {
            return response()->json(['message' => 'Invalid role assignment detected.'], 403);
        }

        if ($actualRole !== $role) {
            return response()->json([
                'message' => "Access denied. Required role: {$role}.",
            ], 403);
        }

        return $next($request);
    }
}

