<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class DomainReputationChecker
{
    private array $suspiciousTlds;

    private int $whoisTimeout;

    public function __construct()
    {
        $this->suspiciousTlds = config('risk-scoring.suspicious_tlds', []);
        $this->whoisTimeout = config('risk-scoring.whois.timeout', 5000);
    }

    public function check(string $domain): DomainReputationResult
    {
        $normalized = strtolower(trim($domain));
        $error = null;

        $suspiciousTld = $this->checkSuspiciousTld($normalized);

        $domainAgeDays = null;
        try {
            $domainAgeDays = $this->getDomainAge($normalized);
        } catch (\Throwable $e) {
            Log::warning("WHOIS lookup failed for {$normalized}: {$e->getMessage()}");
            $error = $error ?? 'WHOIS lookup failed';
        }

        $sslValid = null;
        try {
            $sslValid = $this->checkSsl($normalized);
        } catch (\Throwable $e) {
            Log::warning("SSL check failed for {$normalized}: {$e->getMessage()}");
        }

        return new DomainReputationResult(
            domainAgeDays: $domainAgeDays,
            sslValid: $sslValid,
            suspiciousTld: $suspiciousTld,
            error: $error
        );
    }

    public function checkSuspiciousTld(string $domain): bool
    {
        foreach ($this->suspiciousTlds as $tld) {
            if (str_ends_with($domain, $tld)) {
                return true;
            }
        }

        return false;
    }

    public function getDomainAge(string $domain): ?int
    {
        $tld = $this->extractTld($domain);
        $server = config("risk-scoring.whois_servers.{$tld}", 'whois.iana.org');

        $creationDate = $this->queryWhois($domain, $server, $this->whoisTimeout);

        if ($creationDate === null) {
            return null;
        }

        $created = strtotime($creationDate);
        if ($created === false) {
            return null;
        }

        return (int) ((time() - $created) / 86400);
    }

    public function checkSsl(string $domain): ?bool
    {
        $context = stream_context_create([
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'capture_peer_cert' => true,
            ],
        ]);

        $errno = 0;
        $errstr = '';

        $socket = @stream_socket_client(
            "ssl://{$domain}:443",
            $errno,
            $errstr,
            5,
            STREAM_CLIENT_CONNECT,
            $context
        );

        if (! $socket) {
            return false;
        }

        $params = stream_context_get_params($socket);
        @fclose($socket);

        if (empty($params['options']['ssl']['peer_certificate'])) {
            return false;
        }

        $cert = $params['options']['ssl']['peer_certificate'];
        $validTo = openssl_x509_parse($cert)['validTo_time_t'] ?? null;

        if ($validTo === null) {
            return false;
        }

        return $validTo > time();
    }

    private function extractTld(string $domain): string
    {
        $parts = explode('.', $domain);
        if (count($parts) < 2) {
            return '';
        }

        return end($parts);
    }

    private function queryWhois(string $domain, string $server, int $timeoutMs): ?string
    {
        try {
            $timeoutSec = (int) ceil($timeoutMs / 1000);

            $socket = @fsockopen($server, 43, $errno, $errstr, $timeoutSec);

            if (! $socket) {
                Log::warning("WHOIS connection to {$server} failed: {$errstr}");

                return null;
            }

            stream_set_timeout($socket, $timeoutSec);

            fwrite($socket, $domain."\r\n");

            $response = '';
            while (! feof($socket)) {
                $response .= fread($socket, 8192);
            }
            fclose($socket);

            return $this->parseCreationDate($response);
        } catch (\Throwable $e) {
            Log::warning("WHOIS query failed: {$e->getMessage()}");

            return null;
        }
    }

    private function parseCreationDate(string $whoisResponse): ?string
    {
        $patterns = [
            '/Creation Date:\s*(.+)/i',
            '/created:\s*(.+)/i',
            '/Created on:\s*(.+)/i',
            '/Domain Create Date:\s*(.+)/i',
            '/Creation date:\s*(.+)/i',
            '/Registered on:\s*(.+)/i',
            '/Registration Date:\s*(.+)/i',
            '/Domain Registration Date:\s*(.+)/i',
            '/\[created\]\s*(.+)/i',
            '/created-date:\s*(.+)/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $whoisResponse, $matches)) {
                return trim($matches[1]);
            }
        }

        return null;
    }
}
