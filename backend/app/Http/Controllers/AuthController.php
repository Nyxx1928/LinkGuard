<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'] ?? null,
            'email' => $data['email'],
            'password' => $data['password'],
        ]);

        // Generate 6-digit OTP
        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user->email_verification_code = Hash::make($otp);
        $user->email_verification_code_expires_at = now()->addMinutes(15);
        $user->save();

        // Send OTP via email using Laravel's notification system
        try {
            $user->notify(new \App\Notifications\EmailOtpNotification($otp));
        } catch (\Exception $e) {
            logger()->warning('Failed to send OTP email', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json([
            'message' => 'Account created. Please check your email for the verification code.',
            'email' => $user->email,
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $data = $request->validated();

        $user = User::where('email', $data['email'])->first();

        // Timing-safe comparison: always run Hash::check()
        $dummyHash = '$2y$12$'.str_repeat('0', 60);

        if (! $user || ! Hash::check($data['password'], $user->password ?? $dummyHash)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if email is verified
        if ($user->email_verified_at === null) {
            return response()->json([
                'message' => 'Please verify your email first.',
                'email' => $user->email,
            ], 403);
        }

        // Multi-device support: create new token without deleting old ones
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['authenticated' => false], 401);
        }

        return response()->json(['authenticated' => true, 'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'email_verified_at' => $user->email_verified_at?->toISOString(),
        ]]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }
}
