<?php

namespace Tests\Unit\Risk;

use App\Services\BlocklistChecker;
use App\Services\BlocklistResult;
use Tests\TestCase;

class BlocklistCheckerTest extends TestCase
{
    public function test_returns_not_found_when_all_disabled(): void
    {
        config()->set('risk-scoring.blocklist.google_safe_browsing.enabled', false);
        config()->set('risk-scoring.blocklist.phishtank.enabled', false);
        config()->set('risk-scoring.blocklist.virustotal.enabled', false);

        $checker = new BlocklistChecker;
        $result = $checker->check('example.com');

        $this->assertInstanceOf(BlocklistResult::class, $result);
        $this->assertFalse($result->found);
        $this->assertEmpty($result->sources);
    }

    public function test_returns_not_found_with_empty_api_keys(): void
    {
        config()->set('risk-scoring.blocklist.google_safe_browsing.enabled', true);
        config()->set('risk-scoring.blocklist.google_safe_browsing.api_key', '');

        $checker = new BlocklistChecker;
        $result = $checker->check('example.com');

        $this->assertFalse($result->found);
    }

    public function test_check_does_not_throw_exceptions(): void
    {
        config()->set('risk-scoring.blocklist.google_safe_browsing.enabled', false);
        config()->set('risk-scoring.blocklist.phishtank.enabled', false);
        config()->set('risk-scoring.blocklist.virustotal.enabled', false);

        $checker = new BlocklistChecker;
        $result = $checker->check('');

        $this->assertInstanceOf(BlocklistResult::class, $result);
        $this->assertFalse($result->found);
    }

    public function test_returns_blocklist_result_object(): void
    {
        $checker = new BlocklistChecker;
        $result = $checker->check('domain.test');

        $this->assertInstanceOf(BlocklistResult::class, $result);
        $this->assertIsBool($result->found);
        $this->assertIsArray($result->sources);
    }
}
