<?php

namespace Tests\Unit\Risk;

use App\Services\DomainReputationChecker;
use Tests\TestCase;

class DomainReputationCheckerTest extends TestCase
{
    private DomainReputationChecker $checker;

    protected function setUp(): void
    {
        parent::setUp();
        $this->checker = new DomainReputationChecker;
    }

    public function test_suspicious_tld_detected(): void
    {
        $result = $this->checker->check('phishing-site.xyz');
        $this->assertTrue($result->suspiciousTld);
    }

    public function test_suspicious_tld_dot_top_detected(): void
    {
        $result = $this->checker->check('scam.top');
        $this->assertTrue($result->suspiciousTld);
    }

    public function test_suspicious_tld_not_detected_for_normal_tld(): void
    {
        $result = $this->checker->check('example.com');
        $this->assertFalse($result->suspiciousTld);
    }

    public function test_ssl_check_for_known_good_domain(): void
    {
        $result = $this->checker->check('google.com');
        $this->assertTrue($result->hasValidSsl());
    }

    public function test_ssl_check_for_nonexistent_domain(): void
    {
        $result = $this->checker->check('this-domain-does-not-exist-99999.com');
        $this->assertFalse($result->hasValidSsl());
    }

    public function test_domain_age_returns_int_for_known_domain(): void
    {
        $result = $this->checker->check('google.com');
        if ($result->domainAgeDays !== null) {
            $this->assertIsInt($result->domainAgeDays);
            $this->assertGreaterThan(0, $result->domainAgeDays);
        }
    }

    public function test_domain_age_returns_null_for_nonexistent_domain(): void
    {
        $result = $this->checker->check('definitely-nonexistent-domain-99999.com');
        $this->assertNull($result->domainAgeDays);
    }

    public function test_check_does_not_throw_exceptions(): void
    {
        $result = $this->checker->check('');
        $this->assertInstanceOf(\App\Services\DomainReputationResult::class, $result);
    }

    public function test_check_valid_domain_returns_result_object(): void
    {
        $result = $this->checker->check('example.com');
        $this->assertInstanceOf(\App\Services\DomainReputationResult::class, $result);
        $this->assertIsBool($result->suspiciousTld);
    }
}
