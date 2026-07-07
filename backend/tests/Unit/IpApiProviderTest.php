<?php

namespace Tests\Unit;

use App\Services\GeoResult;
use App\Services\IpApiProvider;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * Unit tests for the IpApiProvider service.
 *
 * These tests verify specific examples of successful and failed API responses.
 * We use Laravel's HTTP fake to mock API responses without making real network calls.
 *
 * Teaching Point: HTTP::fake() allows us to test HTTP interactions without
 * actually hitting external APIs. This makes tests fast, reliable, and independent
 * of network conditions or API availability.
 */
class IpApiProviderTest extends TestCase
{
    private IpApiProvider $provider;

    protected function setUp(): void
    {
        parent::setUp();
        $this->provider = new IpApiProvider;
    }

    /**
     * Test successful geolocation lookup with all fields.
     */
    public function test_successful_lookup_with_all_fields(): void
    {
        // Mock HTTP response from ip-api.com
        Http::fake([
            'ip-api.com/*' => Http::response([
                'status' => 'success',
                'country' => 'United States',
                'countryCode' => 'US',
                'region' => 'CA',
                'regionName' => 'California',
                'city' => 'Mountain View',
                'zip' => '94043',
                'lat' => 37.4192,
                'lon' => -122.0574,
                'timezone' => 'America/Los_Angeles',
                'isp' => 'Google LLC',
                'org' => 'Google LLC',
                'as' => 'AS15169 Google LLC',
                'proxy' => false,
                'hosting' => true,
                'mobile' => false,
                'query' => '8.8.8.8',
            ], 200),
        ]);

        $result = $this->provider->lookup('8.8.8.8');

        $this->assertInstanceOf(GeoResult::class, $result);
        $this->assertEquals('success', $result->status);
        $this->assertTrue($result->isSuccessful());
        $this->assertEquals('8.8.8.8', $result->query);
        $this->assertEquals('United States', $result->country);
        $this->assertEquals('US', $result->countryCode);
        $this->assertEquals('CA', $result->region);
        $this->assertEquals('California', $result->regionName);
        $this->assertEquals('Mountain View', $result->city);
        $this->assertEquals('94043', $result->zip);
        $this->assertEquals(37.4192, $result->lat);
        $this->assertEquals(-122.0574, $result->lon);
        $this->assertEquals('America/Los_Angeles', $result->timezone);
        $this->assertEquals('Google LLC', $result->isp);
        $this->assertEquals('Google LLC', $result->org);
        $this->assertEquals('AS15169 Google LLC', $result->as);
        $this->assertFalse($result->proxy);
        $this->assertTrue($result->hosting);
        $this->assertFalse($result->mobile);
    }

    /**
     * Test API failure response (status=fail).
     */
    public function test_handles_api_failure_response(): void
    {
        // Mock API failure response
        Http::fake([
            'ip-api.com/*' => Http::response([
                'status' => 'fail',
                'message' => 'invalid query',
            ], 200),
        ]);

        $result = $this->provider->lookup('invalid');

        $this->assertInstanceOf(GeoResult::class, $result);
        $this->assertEquals('fail', $result->status);
        $this->assertFalse($result->isSuccessful());
        $this->assertEquals('invalid query', $result->message);
        $this->assertNull($result->query);
    }

    /**
     * Test HTTP request failure (non-2xx status code).
     */
    public function test_handles_http_error(): void
    {
        // Mock HTTP error response
        Http::fake([
            'ip-api.com/*' => Http::response(null, 500),
        ]);

        $result = $this->provider->lookup('8.8.8.8');

        $this->assertEquals('fail', $result->status);
        $this->assertFalse($result->isSuccessful());
        $this->assertNotNull($result->message);
        $this->assertStringContainsString('Failed to fetch', $result->message);
    }

    /**
     * Test timeout handling.
     */
    public function test_handles_timeout(): void
    {
        // Mock timeout exception
        Http::fake([
            'ip-api.com/*' => function () {
                throw new \Illuminate\Http\Client\ConnectionException('Connection timeout');
            },
        ]);

        $result = $this->provider->lookup('8.8.8.8');

        $this->assertEquals('fail', $result->status);
        $this->assertFalse($result->isSuccessful());
        $this->assertNotNull($result->message);
    }

    /**
     * Test successful lookup with minimal fields (some fields missing).
     */
    public function test_handles_partial_response(): void
    {
        // Mock response with only some fields
        Http::fake([
            'ip-api.com/*' => Http::response([
                'status' => 'success',
                'country' => 'United States',
                'countryCode' => 'US',
                'query' => '8.8.8.8',
                // Other fields missing
            ], 200),
        ]);

        $result = $this->provider->lookup('8.8.8.8');

        $this->assertEquals('success', $result->status);
        $this->assertTrue($result->isSuccessful());
        $this->assertEquals('8.8.8.8', $result->query);
        $this->assertEquals('United States', $result->country);
        $this->assertEquals('US', $result->countryCode);

        // Missing fields should be null
        $this->assertNull($result->city);
        $this->assertNull($result->isp);
        $this->assertNull($result->proxy);
    }

    /**
     * Test GeoResult toArray() method.
     */
    public function test_geo_result_to_array(): void
    {
        Http::fake([
            'ip-api.com/*' => Http::response([
                'status' => 'success',
                'country' => 'United States',
                'countryCode' => 'US',
                'city' => 'Mountain View',
                'lat' => 37.4192,
                'lon' => -122.0574,
                'isp' => 'Google LLC',
                'proxy' => false,
                'hosting' => true,
                'mobile' => false,
                'query' => '8.8.8.8',
            ], 200),
        ]);

        $result = $this->provider->lookup('8.8.8.8');
        $array = $result->toArray();

        $this->assertIsArray($array);
        $this->assertEquals('success', $array['status']);
        $this->assertEquals('United States', $array['country']);
        $this->assertEquals('US', $array['countryCode']);
        $this->assertEquals('Mountain View', $array['city']);
        $this->assertEquals(37.4192, $array['lat']);
        $this->assertEquals(-122.0574, $array['lon']);
        $this->assertEquals('Google LLC', $array['isp']);
        $this->assertFalse($array['proxy']);
        $this->assertTrue($array['hosting']);
        $this->assertFalse($array['mobile']);
    }

    /**
     * Test that correct API endpoint and fields are requested.
     */
    public function test_requests_correct_endpoint_and_fields(): void
    {
        Http::fake([
            'ip-api.com/*' => Http::response([
                'status' => 'success',
                'query' => '8.8.8.8',
            ], 200),
        ]);

        $this->provider->lookup('8.8.8.8');

        // Verify the request was made to the correct endpoint with correct parameters
        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'ip-api.com/json/8.8.8.8') &&
                   str_contains($request->url(), 'fields=');
        });
    }
}
