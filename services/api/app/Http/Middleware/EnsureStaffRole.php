<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Server-enforced role gate for the admin API: hidden buttons are not
 * access control. Only `admin` and `editor` rows in `users` pass.
 */
class EnsureStaffRole
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->hasStaffRole()) {
            return response()->json(['message' => 'Forbidden: admin or editor role required.'], 403);
        }

        return $next($request);
    }
}
