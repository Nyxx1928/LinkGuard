<?php

namespace App\Http\Controllers;

use App\Models\LookupHistory;
use App\Services\GeoProviderInterface;
use App\Services\ResolverInterface;
use App\Services\RiskScorer;
use Illuminate\Http\Request;

/**
 * AnalyzeController - Main orchestration controller for target analysis.
 *
 * This controller is the heart of LinkGuard. It coordinates between three services:
 * 1. Resolver: Converts any target (email, URL, domain, IP) to an IP address
 * 2. GeoProvider: Fetches enriched geolocation and network intelligence
 * 3. RiskScorer: Computes risk level based on network characteristics
 *
 * The controller is "thin" - it just validates input, calls services, and returns responses.
 * All business logic lives in the service classes, making this easy to test and maintain.
 *
 * Teaching Point: This is a great example of the Single Responsibility Principle.
 * The controller doesn't know HOW to resolve DNS or score risk - it just knows
 * WHAT to call and WHEN. This separation makes each piece independently testable.
 */
class AnalyzeController extends Controller
{
    /**
     * Constructor with dependency injection.
     *
     * Laravel automatically injects these dependencies when the controller is instantiated.
     * This makes testing easy - we can inject mock services in tests.
     */
    public function __construct(
        private ResolverInterface $resolver,
        private GeoProviderInterface $geoProvider,
        private RiskScorer $riskScorer
    ) {}

    /**
     * Analyze a target and return enriched data.
     *
     * This is the main endpoint that brings everything together:
     * - Validates the input
     * - Resolves the target to an IP
     * - Fetches geo data for the IP
     * - Computes risk level
     * - Persists the lookup (for authenticated users)
     * - Returns unified response
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function analyze(Request $request)
    {
        return $this->performAnalysis($request, true);
    }

    /**
     * Public analyze endpoint - same as analyze but without authentication.
     *
     * This endpoint allows unauthenticated users to perform lookups on the landing page.
     * Key differences from the authenticated endpoint:
     * - No authentication required
     * - Does NOT persist lookup history
     * - Does NOT include uuid or created_at in response
     * - Rate limited to 10 requests/minute per IP
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function analyzePublic(Request $request)
    {
        return $this->performAnalysis($request, false);
    }

    /**
     * Shared analysis logic for both authenticated and public endpoints.
     *
     * @param  bool  $persistHistory  Whether to save the lookup to history
     * @return \Illuminate\Http\JsonResponse
     */
    private function performAnalysis(Request $request, bool $persistHistory)
    {
        // Step 1: Validate input
        $validated = $request->validate([
            'target' => 'required|string|max:500',
        ]);

        $target = trim($validated['target']);

        // Step 2: Resolve target to IP
        $resolverResult = $this->resolver->resolve($target);

        // Handle resolution errors
        if ($resolverResult->error !== null) {
            return response()->json([
                'error' => true,
                'message' => $resolverResult->error,
                'target' => $target,
            ], 404);
        }

        // Step 3: Fetch geo data for resolved IP
        $geoResult = $this->geoProvider->lookup($resolverResult->resolvedIp);

        // Handle geo provider errors
        if ($geoResult->status !== 'success') {
            return response()->json([
                'error' => true,
                'message' => $geoResult->message ?? 'Failed to fetch geo data',
                'target' => $target,
                'resolved_ip' => $resolverResult->resolvedIp,
            ], 500);
        }

        // Step 4: Extract domain for risk scoring
        $domain = $this->extractDomain($target);

        // Step 5: Compute risk score with multi-signal weighted assessment
        $riskResult = $this->riskScorer->score($domain, $resolverResult->resolvedIp, $geoResult);

        // Step 6: Build unified response
        $response = [
            'target' => $target,
            'type' => $resolverResult->type,
            'resolved_ip' => $resolverResult->resolvedIp,
            'geo' => [
                'query' => $geoResult->query,
                'status' => $geoResult->status,
                'country' => $geoResult->country,
                'countryCode' => $geoResult->countryCode,
                'region' => $geoResult->region,
                'regionName' => $geoResult->regionName,
                'city' => $geoResult->city,
                'zip' => $geoResult->zip,
                'lat' => $geoResult->lat,
                'lon' => $geoResult->lon,
                'timezone' => $geoResult->timezone,
                'isp' => $geoResult->isp,
                'org' => $geoResult->org,
                'as' => $geoResult->as,
                'proxy' => $geoResult->proxy,
                'hosting' => $geoResult->hosting,
                'mobile' => $geoResult->mobile,
            ],
            'risk_level' => $riskResult->level,
            'risk_score' => $riskResult->score,
            'risk_breakdown' => $riskResult->breakdown,
            'dns_records' => $resolverResult->dnsRecords,
        ];

        // Step 7: Persist lookup for authenticated users (only if requested)
        if ($persistHistory) {
            $user = $request->user();
            if ($user) {
                $lookupHistory = LookupHistory::create([
                    'user_id' => $user->id,
                    'type' => $resolverResult->type,
                    'target' => $target,
                    'resolved_ip' => $resolverResult->resolvedIp,
                    'result' => [
                        'geo' => $response['geo'],
                        'dns_records' => $resolverResult->dnsRecords,
                    ],
                    'risk_level' => $riskResult->level,
                ]);

                // Add uuid and created_at to response
                $response['uuid'] = $lookupHistory->uuid;
                $response['created_at'] = $lookupHistory->created_at->toIso8601String();
            }
        }

        return response()->json($response);
    }

    /**
     * Extract domain from a target string for risk scoring.
     *
     * Handles URLs, emails, domains, and IPs.
     */
    private function extractDomain(string $target): string
    {
        // If it's a URL, extract the hostname
        if (preg_match('/^https?:\/\//i', $target)) {
            $hostname = parse_url($target, PHP_URL_HOST);
            if ($hostname) {
                return $hostname;
            }
        }

        // If it's an email, extract the domain part
        if (preg_match('/^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/', $target, $matches)) {
            return $matches[1];
        }

        // IP addresses are returned as-is
        if (filter_var($target, FILTER_VALIDATE_IP)) {
            return $target;
        }

        // Assume it's a domain
        return $target;
    }
}
