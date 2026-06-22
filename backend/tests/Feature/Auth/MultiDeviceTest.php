<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

class MultiDeviceTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private string $password = 'Password123!';

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make($this->password),
        ]);
    }

    public function test_login_creates_new_token_without_deleting_old_ones(): void
    {
        $response1 = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => $this->password,
        ]);
        $response1->assertStatus(200);
        $token1 = $response1->json('token');

        // Second login — should create second token, not invalidate first
        $response2 = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => $this->password,
        ]);
        $response2->assertStatus(200);

        // Both tokens should exist in DB
        $this->assertEquals(2, PersonalAccessToken::count());
        $this->assertNotNull(PersonalAccessToken::findToken($token1));
    }

    public function test_revoke_others_keeps_current_token(): void
    {
        $response1 = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => $this->password,
        ]);
        $token1 = $response1->json('token');

        $response2 = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => $this->password,
        ]);
        $token2 = $response2->json('token');

        $this->assertEquals(2, PersonalAccessToken::count());

        // Revoke others using token2
        $revokeResponse = $this->withHeaders([
            'Authorization' => 'Bearer '.$token2,
        ])->postJson('/api/sessions/revoke-others');

        $revokeResponse->assertStatus(200);
        $revokeResponse->assertJson(['message' => 'Other sessions revoked.']);

        // Token1 should be deleted from DB
        $this->assertEquals(1, PersonalAccessToken::count());
        $this->assertNull(PersonalAccessToken::findToken($token1));

        // Token2 should still be findable
        $this->assertNotNull(PersonalAccessToken::findToken($token2));
    }

    public function test_revoke_others_with_single_session_returns_ok(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => $this->password,
        ]);
        $token = $response->json('token');

        $this->assertEquals(1, PersonalAccessToken::count());

        // Revoke others with only one token — should succeed with no deletions
        $revokeResponse = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->postJson('/api/sessions/revoke-others');

        $revokeResponse->assertStatus(200);
        $revokeResponse->assertJson(['message' => 'Other sessions revoked.']);

        // Token should still exist
        $this->assertEquals(1, PersonalAccessToken::count());
        $this->assertNotNull(PersonalAccessToken::findToken($token));
    }
}
