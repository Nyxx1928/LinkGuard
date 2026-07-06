<?php

namespace App\Services;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

/**
 * GeoProvider implementation using ip-api.com.
 *
 * This provider fetches enriched geolocation and network intelligence data
 * from the ip-api.com free API. The API provides:
 * - Geographic data (country, city, coordinates, timezone)
 * - ISP and organization information
 * - Network flags (proxy, hosting, mobile detection)
 *
 * API Documentation: https://ip-api.com/docs/api:json
 *
 * Rate Limits (Free tier):
 * - 45 requests per minute per IP
 * - No API key required
 *
 * Teaching Point: We're using Laravel's HTTP client facade which provides
 * a clean, expressive interface for making HTTP requests. It handles timeouts,
 * retries, and error handling automatically.
 */
class IpApiProvider implements GeoProviderInterface
{
    /**
     * API endpoint for ip-api.com JSON API.
     */
    private const API_ENDPOINT = 'https://ip-api.com/json/';

    /**
     * Fields to request from the API.
     *
     * We specify exactly which fields we need to minimize response size
     * and ensure we get all required data for risk scoring.
     */
    private const FIELDS = 'status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,proxy,hosting,mobile,query';

    /**
     * Request timeout in seconds.
     */
    private const TIMEOUT = 10;

    /**
     * Look up geolocation and network data for an IP address.
     *
     * Makes an HTTP GET request to ip-api.com with the specified fields.
     * The API returns JSON with all requested data or an error status.
     *
     * @param  string  $ip  The IP address to look up
     * @return GeoResult The geolocation result with enriched data
     */
    public function lookup(string $ip): GeoResult
    {
        try {
            // Make HTTP GET request to ip-api.com
            // Format: http://ip-api.com/json/{ip}?fields={fields}
            $response = Http::timeout(self::TIMEOUT)
                ->get(self::API_ENDPOINT.$ip, [
                    'fields' => self::FIELDS,
                ]);

            // Check if the request was successful (2xx status code)
            if (! $response->successful()) {
                return new GeoResult(
                    status: 'fail',
                    message: 'Failed to fetch geolocation data'
                );
            }

            // Parse JSON response
            $data = $response->json();

            // Check if API returned an error status
            if (isset($data['status']) && $data['status'] === 'fail') {
                return new GeoResult(
                    status: 'fail',
                    message: $data['message'] ?? 'Unknown API error'
                );
            }

            // Parse successful response into GeoResult
            return $this->parseResponse($data);

        } catch (RequestException $e) {
            // Handle HTTP request exceptions (timeouts, connection errors, etc.)
            return new GeoResult(
                status: 'fail',
                message: 'Failed to fetch geolocation data'
            );
        } catch (\Exception $e) {
            // Handle any other unexpected exceptions
            return new GeoResult(
                status: 'fail',
                message: 'Failed to fetch geolocation data'
            );
        }
    }

    /**
     * Parse the API response into a GeoResult object.
     *
     * The ip-api.com API returns all fields as top-level keys in the JSON response.
     * We map these directly to GeoResult properties.
     *
     * Teaching Point: We use null coalescing (??) to provide default values
     * for optional fields. This ensures we always have a valid GeoResult object
     * even if some fields are missing from the API response.
     *
     * @param  array<string, mixed>  $data  The parsed JSON response
     * @return GeoResult The structured geolocation result
     */
    private function parseResponse(array $data): GeoResult
    {
        return new GeoResult(
            status: $data['status'] ?? 'fail',
            message: $data['message'] ?? null,
            query: $data['query'] ?? null,
            country: $data['country'] ?? null,
            countryCode: $data['countryCode'] ?? null,
            region: $data['region'] ?? null,
            regionName: $data['regionName'] ?? null,
            city: $data['city'] ?? null,
            zip: $data['zip'] ?? null,
            lat: isset($data['lat']) ? (float) $data['lat'] : null,
            lon: isset($data['lon']) ? (float) $data['lon'] : null,
            timezone: $data['timezone'] ?? null,
            isp: $data['isp'] ?? null,
            org: $data['org'] ?? null,
            as: $data['as'] ?? null,
            proxy: isset($data['proxy']) ? (bool) $data['proxy'] : null,
            hosting: isset($data['hosting']) ? (bool) $data['hosting'] : null,
            mobile: isset($data['mobile']) ? (bool) $data['mobile'] : null
        );
    }
}
