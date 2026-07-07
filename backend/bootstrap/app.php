<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Token-based auth — no session or CSRF middleware needed
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Always return JSON for API routes
        $exceptions->shouldRenderJsonWhen(function (Request $request) {
            return $request->expectsJson() || $request->is('api/*');
        });

        // Catch all exceptions and return safe, generic messages
        $exceptions->render(function (Throwable $e, Request $request) {
            $status = match (true) {
                method_exists($e, 'getStatusCode') => $e->getStatusCode(),
                isset($e->statusCode) => $e->statusCode,
                isset($e->status) => $e->status,
                default => 500,
            };

            // Only expose validation and auth error details (4xx status codes)
            if ($status < 500) {
                return response()->json([
                    'error' => true,
                    'message' => $e->getMessage(),
                ], $status);
            }

            // Log the real error for internal debugging (won't show to user)
            logger()->error($e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            // Return generic message for 500+ errors
            return response()->json([
                'error' => true,
                'message' => 'An unexpected error occurred. Please try again later.',
            ], 500);
        });
    })->create();
