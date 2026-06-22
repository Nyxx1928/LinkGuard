<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class KnownServicesWhitelist
{
    private array $services = [];

    public function __construct()
    {
        $this->loadServices();
    }

    public function isKnown(string $domain): bool
    {
        $normalized = strtolower(trim($domain));

        foreach ($this->services as $known) {
            if ($normalized === $known) {
                return true;
            }
            if (str_ends_with($normalized, '.'.$known)) {
                return true;
            }
        }

        return false;
    }

    public function getServices(): array
    {
        return $this->services;
    }

    private function loadServices(): void
    {
        $path = storage_path('app/known-services.json');

        if (! file_exists($path)) {
            Log::warning('Known services whitelist file not found at: '.$path);
            $this->services = [];

            return;
        }

        $contents = file_get_contents($path);
        $decoded = json_decode($contents, true);

        if (! is_array($decoded)) {
            Log::warning('Known services whitelist file is invalid JSON.');
            $this->services = [];

            return;
        }

        $this->services = array_map(
            fn (string $s) => strtolower(trim($s)),
            $decoded
        );
    }
}
