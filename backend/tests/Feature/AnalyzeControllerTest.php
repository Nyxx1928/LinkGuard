<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Integration tests for AnalyzeController.
 *
 * These tests verify the complete flow from HTTP request to database persistence.
 * We test with real services (not mocks) to ensure everything works together.
 */
class AnalyzeControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that the analyze endpoint requires authentication.
     */
    public function test_analyze_requires_authentication(): void
    {
        $response = $this->postJson('/api/analyze', [
            'target' => 'example.com',
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test that the analyze endpoint validates the target field.
     */
    public function test_analyze_validates_target_field(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/analyze', []);

        $response->assertStatus(422)
            ->assertJson([
                'error' => true,
                'message' => 'The target field is required.',
            ]);
    }

    /**
     * Test successful analysis of a domain.
     *
     * We use example.com because it's guaranteed to exist and resolve.
     */
    public function test_analyze_domain_success(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/analyze', [
                'target' => 'example.com',
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'target',
                'type',
                'resolved_ip',
                'geo' => [
                    'query',
                    'status',
                    'country',
                    'countryCode',
                    'city',
                    'isp',
                    'org',
                    'proxy',
                    'hosting',
                ],
                'risk_level',
                'risk_score',
                'risk_breakdown',
                'dns_records',
                'uuid',
                'created_at',
            ]);

        // Verify the lookup was persisted
        $this->assertDatabaseHas('lookup_history', [
            'user_id' => $user->id,
            'target' => 'example.com',
            'type' => 'domain',
        ]);
    }

    /**
     * Test successful analysis of an IP address.
     *
     * We use Google's public DNS (8.8.8.8) as a known-good IP.
     */
    public function test_analyze_ip_success(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/analyze', [
                'target' => '8.8.8.8',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'target' => '8.8.8.8',
                'type' => 'ip',
                'resolved_ip' => '8.8.8.8',
            ]);

        // Verify the lookup was persisted
        $this->assertDatabaseHas('lookup_history', [
            'user_id' => $user->id,
            'target' => '8.8.8.8',
            'type' => 'ip',
            'resolved_ip' => '8.8.8.8',
        ]);
    }

    /**
     * Test that private IP addresses are rejected.
     */
    public function test_analyze_rejects_private_ip(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/analyze', [
                'target' => '192.168.1.1',
            ]);

        $response->assertStatus(404)
            ->assertJson([
                'error' => true,
            ]);

        // Verify the lookup was NOT persisted
        $this->assertDatabaseMissing('lookup_history', [
            'user_id' => $user->id,
            'target' => '192.168.1.1',
        ]);
    }

    /**
     * Test that DNS resolution failures return 404.
     */
    public function test_analyze_handles_dns_failure(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/analyze', [
                'target' => 'this-domain-definitely-does-not-exist-12345.com',
            ]);

        $response->assertStatus(404)
            ->assertJson([
                'error' => true,
            ]);

        // Verify the lookup was NOT persisted
        $this->assertDatabaseMissing('lookup_history', [
            'user_id' => $user->id,
            'target' => 'this-domain-definitely-does-not-exist-12345.com',
        ]);
    }

    /**
     * Test that the response includes risk level.
     */
    public function test_analyze_includes_risk_level(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/analyze', [
                'target' => 'example.com',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('risk_level', function ($riskLevel) {
                return in_array($riskLevel, ['LOW', 'MEDIUM', 'HIGH', 'UNKNOWN']);
            });
    }

    /**
     * Test that UUID is generated and unique.
     */
    public function test_analyze_generates_unique_uuid(): void
    {
        $user = User::factory()->create();

        // Perform two lookups
        $response1 = $this->actingAs($user)
            ->postJson('/api/analyze', ['target' => 'example.com']);

        $response2 = $this->actingAs($user)
            ->postJson('/api/analyze', ['target' => 'example.com']);

        $uuid1 = $response1->json('uuid');
        $uuid2 = $response2->json('uuid');

        // UUIDs should be different
        $this->assertNotEquals($uuid1, $uuid2);

        // Both should be valid UUIDs (basic format check)
        $this->assertMatchesRegularExpression(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i',
            $uuid1
        );
        $this->assertMatchesRegularExpression(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i',
            $uuid2
        );
    }
}
