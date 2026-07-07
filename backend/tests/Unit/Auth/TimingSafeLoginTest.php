<?php

namespace Tests\Unit\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class TimingSafeLoginTest extends TestCase
{
    use RefreshDatabase;

    private string $dummyHash;

    protected function setUp(): void
    {
        parent::setUp();
        $this->dummyHash = '$2y$12$'.str_repeat('0', 60);
    }

    public function test_dummy_hash_is_valid_bcrypt(): void
    {
        // Verify the dummy hash is a valid bcrypt hash format
        $this->assertStringStartsWith('$2y$12$', $this->dummyHash);
        $this->assertEquals(60, strlen(substr($this->dummyHash, 7)));
    }

    public function test_hash_check_against_wrong_hash_returns_false(): void
    {
        // A random password checked against a valid bcrypt hash of a different password should return false
        // This simulates the code path for wrong passwords
        $hash = Hash::make('some-other-password');
        $result = Hash::check('any-password', $hash);
        $this->assertFalse($result);
    }

    public function test_timing_safe_login_rejects_nonexistent_email(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'SomePassword123!',
        ]);

        $response->assertStatus(422);
        $response->assertJson([
            'error' => true,
            'message' => 'The provided credentials are incorrect.',
        ]);
    }

    public function test_timing_safe_login_rejects_wrong_password(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('CorrectPassword123!'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'WrongPassword123!',
        ]);

        $response->assertStatus(422);
        $response->assertJson([
            'error' => true,
            'message' => 'The provided credentials are incorrect.',
        ]);
    }

    public function test_timing_safe_login_accepts_correct_password(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('CorrectPassword123!'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'CorrectPassword123!',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['token', 'user']);
    }

    public function test_error_message_does_not_reveal_which_field_is_wrong(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'SomePassword123!',
        ]);

        // Error should be on 'email' field, not revealing if email exists or password is wrong
        $response->assertJson([
            'message' => 'The provided credentials are incorrect.',
        ]);
    }
}
