<?php

use App\Http\Controllers\AnalyzeController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HistoryController;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public endpoints (no authentication required)
Route::get('/lookup/{uuid}', [HistoryController::class, 'show']);
Route::post('/analyze/public', [AnalyzeController::class, 'analyzePublic'])
    ->middleware('throttle:10,1'); // 10 requests per minute
Route::get('/geo/public', function () {
    $response = Http::get('http://ip-api.com/json');

    return response()->json($response->json(), $response->status());
});

// Proxy routes for ip-api.com — avoids browser CORS restrictions
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Analyze endpoint - unified target resolution and enrichment
    Route::post('/analyze', [AnalyzeController::class, 'analyze']);

    // History endpoints
    Route::get('/history', [HistoryController::class, 'index']);
    Route::patch('/history/{id}', [HistoryController::class, 'update']);
    Route::delete('/history/{id}', [HistoryController::class, 'destroy']);
    Route::delete('/history', [HistoryController::class, 'destroyAll']);

    // Get current server/user IP geo
    Route::get('/geo', function () {
        $response = Http::get('http://ip-api.com/json');

        return response()->json($response->json(), $response->status());
    });

    // Get geo for a specific IP
    Route::get('/geo/{ip}', function (string $ip) {
        $response = Http::get("http://ip-api.com/json/{$ip}");

        return response()->json($response->json(), $response->status());
    });
});
