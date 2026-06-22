<?php

namespace Tests\Unit\Risk;

use App\Services\KnownServicesWhitelist;
use Tests\TestCase;

class KnownServicesWhitelistTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $path = storage_path('app/known-services.json');
        if (! file_exists($path)) {
            $dir = dirname($path);
            if (! is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
            file_put_contents($path, json_encode([
                'github.com',
                'resend.com',
                'google.com',
            ]));
        }
    }

    public function test_exact_match_returns_true(): void
    {
        $whitelist = $this->app->make(KnownServicesWhitelist::class);
        $this->assertTrue($whitelist->isKnown('github.com'));
    }

    public function test_subdomain_match_returns_true(): void
    {
        $whitelist = $this->app->make(KnownServicesWhitelist::class);
        $this->assertTrue($whitelist->isKnown('app.resend.com'));
    }

    public function test_deep_subdomain_match_returns_true(): void
    {
        $whitelist = $this->app->make(KnownServicesWhitelist::class);
        $this->assertTrue($whitelist->isKnown('api.internal.resend.com'));
    }

    public function test_unknown_domain_returns_false(): void
    {
        $whitelist = $this->app->make(KnownServicesWhitelist::class);
        $this->assertFalse($whitelist->isKnown('random-unknown-domain-12345.com'));
    }

    public function test_case_insensitive_match(): void
    {
        $whitelist = $this->app->make(KnownServicesWhitelist::class);
        $this->assertTrue($whitelist->isKnown('GiThUb.CoM'));
    }

    public function test_partial_name_does_not_match(): void
    {
        $whitelist = $this->app->make(KnownServicesWhitelist::class);
        $this->assertFalse($whitelist->isKnown('notgithub.com'));
    }

    public function test_get_services_returns_array(): void
    {
        $whitelist = $this->app->make(KnownServicesWhitelist::class);
        $services = $whitelist->getServices();
        $this->assertIsArray($services);
        $this->assertContains('github.com', $services);
    }
}
