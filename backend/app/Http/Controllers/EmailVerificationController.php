<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class EmailVerificationController extends Controller
{
    /**
     * Verify email using OTP code.
     */
    public function verifyCode(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => ['No account found with this email address.'],
            ]);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email already verified.',
            ], 400);
        }

        if ($user->email_verification_code_expires_at === null || $user->email_verification_code_expires_at->isPast()) {
            return response()->json([
                'message' => 'Verification code has expired. Request a new one.',
            ], 400);
        }

        if (! Hash::check($validated['code'], $user->email_verification_code)) {
            return response()->json([
                'message' => 'Invalid verification code.',
            ], 400);
        }

        // Clear OTP fields and mark as verified
        $user->email_verification_code = null;
        $user->email_verification_code_expires_at = null;
        $user->email_verified_at = now();
        $user->save();

        // Create auth token so the user is logged in
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Email verified successfully.',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    /**
     * Resend OTP verification code.
     */
    public function resend(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user) {
            return response()->json([
                'message' => 'No account found with this email address.',
            ], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email already verified.',
            ], 400);
        }

        // Generate new 6-digit OTP
        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user->email_verification_code = Hash::make($otp);
        $user->email_verification_code_expires_at = now()->addMinutes(15);
        $user->save();

        // Send OTP via email
        try {
            $user->notify(new \App\Notifications\EmailOtpNotification($otp));
        } catch (\Exception $e) {
            logger()->warning('Failed to resend OTP email', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to send verification code. Try again later.',
            ], 500);
        }

        return response()->json([
            'message' => 'Verification code sent.',
        ]);
    }
}
