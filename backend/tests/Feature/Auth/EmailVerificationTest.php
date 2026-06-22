<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private string $rawOtp;

    protected function setUp(): void
    {
        parent::setUp();

        // Generate a consistent OTP for the test user
        $this->rawOtp = '123456';
        $hashedOtp = Hash::make($this->rawOtp);

        $this->user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('Password123!'),
            'email_verified_at' => null,
            'email_verification_code' => $hashedOtp,
            'email_verification_code_expires_at' => now()->addMinutes(15),
        ]);
    }

    public function test_user_is_unverified_after_registration(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'newuser@example.com',
            'password' => 'NewPassword123!',
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure(['message', 'email']);
        $response->assertJsonMissing(['token']);

        $user = User::where('email', 'newuser@example.com')->first();
        $this->assertNotNull($user);
        $this->assertNull($user->email_verified_at);
        $this->assertNotNull($user->email_verification_code);
        $this->assertNotNull($user->email_verification_code_expires_at);
    }

    public function test_valid_otp_marks_email_as_verified(): void
    {
        $this->assertNull($this->user->email_verified_at);

        $response = $this->postJson('/api/email/verify-code', [
            'email' => 'test@example.com',
            'code' => $this->rawOtp,
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['token', 'user']);

        $this->user->refresh();
        $this->assertNotNull($this->user->email_verified_at);
        $this->assertNull($this->user->email_verification_code);
    }

    public function test_invalid_otp_returns_error(): void
    {
        $response = $this->postJson('/api/email/verify-code', [
            'email' => 'test@example.com',
            'code' => '999999',
        ]);

        $response->assertStatus(400);
        $response->assertJson(['message' => 'Invalid verification code.']);

        $this->user->refresh();
        $this->assertNull($this->user->email_verified_at);
    }

    public function test_expired_otp_returns_error(): void
    {
        // Manually expire the OTP
        $this->user->email_verification_code_expires_at = now()->subMinute();
        $this->user->save();

        $response = $this->postJson('/api/email/verify-code', [
            'email' => 'test@example.com',
            'code' => $this->rawOtp,
        ]);

        $response->assertStatus(400);
        $response->assertJson(['message' => 'Verification code has expired. Request a new one.']);

        $this->user->refresh();
        $this->assertNull($this->user->email_verified_at);
    }

    public function test_verified_user_cannot_verify_again(): void
    {
        $this->user->markEmailAsVerified();
        $this->user->email_verification_code = null;
        $this->user->save();

        $response = $this->postJson('/api/email/verify-code', [
            'email' => 'test@example.com',
            'code' => $this->rawOtp,
        ]);

        $response->assertStatus(400);
        $response->assertJson(['message' => 'Email already verified.']);
    }

    public function test_resend_generates_new_otp(): void
    {
        $oldCode = $this->user->email_verification_code;

        $response = $this->postJson('/api/email/resend', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Verification code sent.']);

        $this->user->refresh();
        $this->assertNotEquals($oldCode, $this->user->email_verification_code);
        $this->assertNotNull($this->user->email_verification_code_expires_at);
    }

    public function test_resend_without_email_returns_422(): void
    {
        $response = $this->postJson('/api/email/resend', []);

        $response->assertStatus(422);
    }

    public function test_resend_fails_if_already_verified(): void
    {
        $this->user->markEmailAsVerified();

        $response = $this->postJson('/api/email/resend', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(400);
        $response->assertJson(['message' => 'Email already verified.']);
    }

    public function test_login_with_unverified_email_returns_403(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(403);
        $response->assertJson(['message' => 'Please verify your email first.']);
    }

    public function test_login_with_verified_email_returns_token(): void
    {
        $this->user->markEmailAsVerified();

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['token', 'user']);
    }

    public function test_me_endpoint_returns_email_verified_at(): void
    {
        $this->user->markEmailAsVerified();

        $loginResponse = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'Password123!',
        ]);

        $token = $loginResponse->json('token');

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->getJson('/api/me');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'authenticated',
            'user' => ['id', 'name', 'email', 'email_verified_at'],
        ]);
    }
}
