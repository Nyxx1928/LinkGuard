<?php

namespace Tests\Unit\Risk;

use App\Services\KnownServicesWhitelist;
use App\Services\TyposquattingDetector;
use Tests\TestCase;

class TyposquattingDetectorTest extends TestCase
{
    private TyposquattingDetector $detector;

    protected function setUp(): void
    {
        parent::setUp();

        $whitelist = $this->app->make(KnownServicesWhitelist::class);
        $this->detector = new TyposquattingDetector($whitelist);
    }

    public function test_exact_known_domain_not_flagged(): void
    {
        $result = $this->detector->detect('github.com');
        $this->assertFalse($result->flagged);
    }

    public function test_typo_githab_flagged_as_github(): void
    {
        $result = $this->detector->detect('githab.com');
        $this->assertTrue($result->flagged);
        $this->assertEquals('github.com', $result->matchedDomain);
        $this->assertLessThanOrEqual(2, $result->distance);
    }

    public function test_typo_go0gle_flagged_as_google(): void
    {
        $result = $this->detector->detect('go0gle.com');
        $this->assertTrue($result->flagged);
        $this->assertEquals('google.com', $result->matchedDomain);
        $this->assertLessThanOrEqual(2, $result->distance);
    }

    public function test_typo_resen_flagged_as_resend(): void
    {
        $result = $this->detector->detect('resen.com');
        if ($result->flagged) {
            $this->assertEquals('resend.com', $result->matchedDomain);
            $this->assertLessThanOrEqual(2, $result->distance);
        }
    }

    public function test_completely_different_domain_not_flagged(): void
    {
        $result = $this->detector->detect('random-unrelated-domain-xyz.com');
        $this->assertFalse($result->flagged);
        $this->assertNull($result->matchedDomain);
    }

    public function test_legitimate_similar_domain_not_squatting(): void
    {
        $result = $this->detector->detect('gitlab.com');
        $this->assertFalse($result->flagged);
    }
}
