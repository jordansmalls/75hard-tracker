<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Blocks users who have not finished onboarding (choosing a username).
 * Apply with the `onboarded` alias to routes that need a complete profile.
 */
class EnsureUsernameIsSet
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->hasUsername()) {
            return response()->json([
                'message' => 'You must choose a username before continuing.',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
