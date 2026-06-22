<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class BlocklistChecker
{
    public function check(string $domain): BlocklistResult
    {
        $sources = [];
        $config = config('risk-scoring.blocklist', []);

        if ($this->isEnabled('google_safe_browsing', $config)) {
            $result = $this->checkGoogleSafeBrowsing($domain, $config['google_safe_browsing']);
            if ($result) {
                $sources[] = 'google_safe_browsing';
            }
        }

        if ($this->isEnabled('phishtank', $config)) {
            $result = $this->checkPhishTank($domain, $config['phishtank']);
            if ($result) {
                $sources[] = 'phishtank';
            }
        }

        if ($this->isEnabled('virustotal', $config)) {
            $result = $this->checkVirusTotal($domain, $config['virustotal']);
            if ($result) {
                $sources[] = 'virustotal';
            }
        }

        return new BlocklistResult(
            found: count($sources) > 0,
            sources: $sources
        );
    }

    private function isEnabled(string $provider, array $config): bool
    {
        return ($config[$provider]['enabled'] ?? false) === true
            && ! empty($config[$provider]['api_key'] ?? '');
    }

    private function checkGoogleSafeBrowsing(string $domain, array $providerConfig): bool
    {
        try {
            $timeoutMs = $providerConfig['timeout'] ?? 5000;
            $apiKey = $providerConfig['api_key'];

            $payload = [
                'client' => [
                    'clientId' => 'linkguard',
                    'clientVersion' => '1.0.0',
                ],
                'threatInfo' => [
                    'threatTypes' => ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
                    'platformTypes' => ['ANY_PLATFORM'],
                    'threatEntryTypes' => ['URL'],
                    'threatEntries' => [
                        ['url' => $domain],
                    ],
                ],
            ];

            $context = stream_context_create([
                'http' => [
                    'method' => 'POST',
                    'header' => "Content-Type: application/json\r\n",
                    'content' => json_encode($payload),
                    'timeout' => (int) ceil($timeoutMs / 1000),
                    'ignore_errors' => true,
                ],
            ]);

            $url = "https://safebrowsing.googleapis.com/v4/threatMatches:find?key={$apiKey}";
            $response = @file_get_contents($url, false, $context);

            if ($response === false) {
                Log::warning('Google Safe Browsing API request failed for: '.$domain);

                return false;
            }

            $data = json_decode($response, true);

            return ! empty($data['matches']);
        } catch (\Throwable $e) {
            Log::warning("Google Safe Browsing check failed: {$e->getMessage()}");

            return false;
        }
    }

    private function checkPhishTank(string $domain, array $providerConfig): bool
    {
        try {
            $timeoutMs = $providerConfig['timeout'] ?? 5000;

            $context = stream_context_create([
                'http' => [
                    'method' => 'POST',
                    'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
                    'content' => http_build_query([
                        'url' => $domain,
                        'format' => 'json',
                        'app_key' => $providerConfig['api_key'],
                    ]),
                    'timeout' => (int) ceil($timeoutMs / 1000),
                    'ignore_errors' => true,
                ],
            ]);

            $url = 'https://checkurl.phishtank.com/checkurl/';
            $response = @file_get_contents($url, false, $context);

            if ($response === false) {
                Log::warning('PhishTank API request failed for: '.$domain);

                return false;
            }

            $data = json_decode($response, true);

            return ($data['results']['in_database'] ?? false) === true
                && ($data['results']['valid'] ?? false) === true;
        } catch (\Throwable $e) {
            Log::warning("PhishTank check failed: {$e->getMessage()}");

            return false;
        }
    }

    private function checkVirusTotal(string $domain, array $providerConfig): bool
    {
        try {
            $timeoutMs = $providerConfig['timeout'] ?? 5000;
            $apiKey = $providerConfig['api_key'];

            $context = stream_context_create([
                'http' => [
                    'method' => 'GET',
                    'header' => "x-apikey: {$apiKey}\r\n",
                    'timeout' => (int) ceil($timeoutMs / 1000),
                    'ignore_errors' => true,
                ],
            ]);

            $url = "https://www.virustotal.com/api/v3/domains/{$domain}";
            $response = @file_get_contents($url, false, $context);

            if ($response === false) {
                Log::warning('VirusTotal API request failed for: '.$domain);

                return false;
            }

            $data = json_decode($response, true);
            $malicious = $data['data']['attributes']['last_analysis_stats']['malicious'] ?? 0;
            $suspicious = $data['data']['attributes']['last_analysis_stats']['suspicious'] ?? 0;

            return ($malicious + $suspicious) > 0;
        } catch (\Throwable $e) {
            Log::warning("VirusTotal check failed: {$e->getMessage()}");

            return false;
        }
    }
}
