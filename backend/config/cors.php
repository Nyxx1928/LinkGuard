<?php

$frontendOriginsEnv = env('FRONTEND_ORIGINS');

if ($frontendOriginsEnv === null || trim((string) $frontendOriginsEnv) === '') {
    // Backward compatibility for older FRONTEND_ORIGIN env setups.
    $frontendOriginsEnv = env(
        'FRONTEND_ORIGIN',
        'http://localhost:3000,http://127.0.0.1:3000,https://link-guard-zero.vercel.app'
    );
}

$frontendOrigins = array_values(array_unique(array_filter(array_map(
    static fn (string $origin): string => rtrim(trim($origin), '/'),
    explode(',', (string) $frontendOriginsEnv)
))));

$frontendOriginPatterns = array_values(array_filter(array_map(
    static fn (string $pattern): string => trim($pattern),
    explode(',', (string) env('FRONTEND_ORIGIN_PATTERNS', ''))
)));

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => $frontendOrigins,

    'allowed_origins_patterns' => $frontendOriginPatterns,

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
