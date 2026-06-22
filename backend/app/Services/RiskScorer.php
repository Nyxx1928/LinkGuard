<?php

namespace App\Services;

class RiskScorer
{
    public function __construct(
        private BlocklistChecker $blocklistChecker,
        private DomainReputationChecker $domainReputationChecker,
        private KnownServicesWhitelist $knownServicesWhitelist,
        private TyposquattingDetector $typosquattingDetector
    ) {}

    /**
     * Score a domain using multi-signal weighted risk assessment.
     *
     * @param  string  $domain  The domain to score
     * @param  string|null  $resolvedIp  The resolved IP address
     * @param  GeoResult|null  $geo  The geolocation result (may be null for failed lookups)
     */
    public function score(string $domain, ?string $resolvedIp, ?GeoResult $geo): RiskScoreResult
    {
        $weights = config('risk-scoring.weights', []);
        $thresholds = config('risk-scoring.thresholds', ['high' => 65, 'medium' => 30]);

        $score = 0;
        $breakdown = [];
        $flagCount = 0;

        // Proxy flag
        if ($geo !== null && $geo->proxy === true) {
            $w = $weights['proxy'] ?? 25;
            $score += $w;
            $breakdown[] = [
                'signal' => 'proxy',
                'weight' => $w,
                'description' => 'IP is flagged as a proxy/anonymizer',
            ];
            $flagCount++;
        }

        // Hosting flag
        if ($geo !== null && $geo->hosting === true) {
            $w = $weights['hosting'] ?? 8;
            $score += $w;
            $breakdown[] = [
                'signal' => 'hosting',
                'weight' => $w,
                'description' => 'IP belongs to a hosting/datacenter range',
            ];
            $flagCount++;
        }

        // Blocklist check
        try {
            $blocklistResult = $this->blocklistChecker->check($domain);
            if ($blocklistResult->found) {
                $w = $weights['on_blocklist'] ?? 40;
                $score += $w;
                $breakdown[] = [
                    'signal' => 'on_blocklist',
                    'weight' => $w,
                    'description' => 'Domain found on blocklist(s): '.implode(', ', $blocklistResult->sources),
                ];
                $flagCount++;
            }
        } catch (\Throwable $e) {
            // Graceful degradation: blocklist check is non-critical
        }

        // Domain reputation checks
        try {
            $reputation = $this->domainReputationChecker->check($domain);

            if ($reputation->domainAgeDays !== null) {
                if ($reputation->domainAgeDays < 7) {
                    $w = $weights['domain_age_under_7_days'] ?? 35;
                    $score += $w;
                    $breakdown[] = [
                        'signal' => 'domain_age_under_7_days',
                        'weight' => $w,
                        'description' => "Domain is only {$reputation->domainAgeDays} days old (< 7 days)",
                    ];
                    $flagCount++;
                } elseif ($reputation->domainAgeDays < 30) {
                    $w = $weights['domain_age_under_30_days'] ?? 25;
                    $score += $w;
                    $breakdown[] = [
                        'signal' => 'domain_age_under_30_days',
                        'weight' => $w,
                        'description' => "Domain is only {$reputation->domainAgeDays} days old (< 30 days)",
                    ];
                    $flagCount++;
                } elseif ($reputation->domainAgeDays < 90) {
                    $w = $weights['domain_age_under_90_days'] ?? 15;
                    $score += $w;
                    $breakdown[] = [
                        'signal' => 'domain_age_under_90_days',
                        'weight' => $w,
                        'description' => "Domain is only {$reputation->domainAgeDays} days old (< 90 days)",
                    ];
                    $flagCount++;
                }
            }

            if ($reputation->sslValid === false) {
                $w = $weights['no_valid_ssl'] ?? 20;
                $score += $w;
                $breakdown[] = [
                    'signal' => 'no_valid_ssl',
                    'weight' => $w,
                    'description' => 'Domain does not have a valid SSL certificate',
                ];
                $flagCount++;
            }

            if ($reputation->suspiciousTld) {
                $w = $weights['suspicious_tld'] ?? 10;
                $score += $w;
                $breakdown[] = [
                    'signal' => 'suspicious_tld',
                    'weight' => $w,
                    'description' => 'Domain uses a TLD frequently associated with malicious activity',
                ];
                $flagCount++;
            }
        } catch (\Throwable $e) {
            // Graceful degradation: domain reputation is non-critical
        }

        // Typosquatting detection
        try {
            $typosquattingResult = $this->typosquattingDetector->detect($domain);
            if ($typosquattingResult->flagged) {
                $w = $weights['typosquatting'] ?? 35;
                $score += $w;
                $breakdown[] = [
                    'signal' => 'typosquatting',
                    'weight' => $w,
                    'description' => "Domain may be typosquatting '{$typosquattingResult->matchedDomain}' (distance: {$typosquattingResult->distance})",
                ];
                $flagCount++;
            }
        } catch (\Throwable $e) {
            // Graceful degradation
        }

        // Known service bonus (reduces risk)
        try {
            if ($this->knownServicesWhitelist->isKnown($domain)) {
                $w = $weights['known_service_bonus'] ?? 30;
                $score -= $w;
                $breakdown[] = [
                    'signal' => 'known_service_bonus',
                    'weight' => -$w,
                    'description' => 'Domain is a recognized legitimate service',
                ];
            }
        } catch (\Throwable $e) {
            // Graceful degradation
        }

        // Clamp score to [0, 100]
        $score = max(0, min(100, $score));

        // Map score to level
        $level = 'LOW';
        if ($score >= ($thresholds['high'] ?? 65)) {
            $level = 'HIGH';
        } elseif ($score >= ($thresholds['medium'] ?? 30)) {
            $level = 'MEDIUM';
        }

        return new RiskScoreResult(
            score: $score,
            level: $level,
            breakdown: $breakdown,
            flagCount: $flagCount
        );
    }
}
