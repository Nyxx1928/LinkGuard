<?php

namespace Tests\Unit;

use App\Services\BlocklistChecker;
use App\Services\BlocklistResult;
use App\Services\DomainReputationChecker;
use App\Services\DomainReputationResult;
use App\Services\GeoResult;
use App\Services\KnownServicesWhitelist;
use App\Services\RiskScorer;
use App\Services\RiskScoreResult;
use App\Services\TyposquattingDetector;
use App\Services\TyposquattingResult;
use Mockery;
use Tests\TestCase;

class RiskScorerTest extends TestCase
{
    private KnownServicesWhitelist $knownServices;

    protected function setUp(): void
    {
        parent::setUp();
        $this->knownServices = $this->app->make(KnownServicesWhitelist::class);
    }

    public function test_proxy_flag_adds_weight(): void
    {
        $scorer = $this->makeScorer();

        $geo = new GeoResult(
            status: 'success',
            query: '1.2.3.4',
            proxy: true,
            hosting: false
        );

        $result = $scorer->score('example.com', '1.2.3.4', $geo);

        $this->assertGreaterThanOrEqual(25, $result->score);
        $this->assertContains('proxy', array_column($result->breakdown, 'signal'));
    }

    public function test_hosting_flag_adds_weight(): void
    {
        $scorer = $this->makeScorer();

        $geo = new GeoResult(
            status: 'success',
            query: '1.2.3.4',
            proxy: false,
            hosting: true
        );

        $result = $scorer->score('example.com', '1.2.3.4', $geo);

        $this->assertGreaterThanOrEqual(8, $result->score);
        $this->assertContains('hosting', array_column($result->breakdown, 'signal'));
    }

    public function test_blocklist_match_adds_weight(): void
    {
        $blocklistResult = new BlocklistResult(found: true, sources: ['google_safe_browsing', 'phishtank']);
        $blocklistMock = Mockery::mock(BlocklistChecker::class);
        $blocklistMock->shouldReceive('check')->andReturn($blocklistResult);

        $scorer = new RiskScorer(
            $blocklistMock,
            new DomainReputationChecker,
            $this->knownServices,
            new TyposquattingDetector($this->knownServices)
        );

        $result = $scorer->score('bad-site.com', '1.2.3.4', null);

        $this->assertGreaterThanOrEqual(40, $result->score);
        $this->assertContains('on_blocklist', array_column($result->breakdown, 'signal'));
    }

    public function test_known_service_bonus_subtracts_weight(): void
    {
        $scorer = $this->makeScorer();

        $geo = new GeoResult(
            status: 'success',
            query: '1.2.3.4',
            proxy: false,
            hosting: false
        );

        $result = $scorer->score('resend.com', '1.2.3.4', $geo);

        $this->assertContains('known_service_bonus', array_column($result->breakdown, 'signal'));
        $bonus = collect($result->breakdown)->firstWhere('signal', 'known_service_bonus');
        $this->assertNotNull($bonus);
        $this->assertLessThan(0, $bonus['weight']);
    }

    public function test_suspicious_tld_adds_weight(): void
    {
        $scorer = $this->makeScorer();

        $result = $scorer->score('some-site.xyz', null, null);

        $this->assertContains('suspicious_tld', array_column($result->breakdown, 'signal'));
    }

    public function test_all_good_signals_gives_low_score(): void
    {
        $scorer = $this->makeScorer();

        $geo = new GeoResult(
            status: 'success',
            query: '1.2.3.4',
            proxy: false,
            hosting: false
        );

        $result = $scorer->score('resend.com', '1.2.3.4', $geo);

        $this->assertEquals('LOW', $result->level);
        $this->assertLessThan(30, $result->score);
    }

    public function test_all_bad_signals_gives_high_score(): void
    {
        $blocklistResult = new BlocklistResult(found: true, sources: ['google_safe_browsing']);
        $blocklistMock = Mockery::mock(BlocklistChecker::class);
        $blocklistMock->shouldReceive('check')->andReturn($blocklistResult);

        $reputationResult = new DomainReputationResult(
            domainAgeDays: 3,
            sslValid: false,
            suspiciousTld: true
        );
        $reputationMock = Mockery::mock(DomainReputationChecker::class);
        $reputationMock->shouldReceive('check')->andReturn($reputationResult);

        $typosquattingResult = new TyposquattingResult(
            flagged: true,
            matchedDomain: 'google.com',
            distance: 1
        );
        $typosquattingMock = Mockery::mock(TyposquattingDetector::class);
        $typosquattingMock->shouldReceive('detect')->andReturn($typosquattingResult);

        $scorer = new RiskScorer(
            $blocklistMock,
            $reputationMock,
            $this->knownServices,
            $typosquattingMock
        );

        $geo = new GeoResult(
            status: 'success',
            query: '1.2.3.4',
            proxy: true,
            hosting: true
        );

        $result = $scorer->score('go0gle.xyz', '1.2.3.4', $geo);

        $this->assertEquals('HIGH', $result->level);
        $this->assertGreaterThanOrEqual(65, $result->score);
    }

    public function test_score_clamped_to_0(): void
    {
        $scorer = $this->makeScorer();

        $geo = new GeoResult(
            status: 'success',
            query: '1.2.3.4',
            proxy: false,
            hosting: false
        );

        $result = $scorer->score('resend.com', '1.2.3.4', $geo);

        $this->assertGreaterThanOrEqual(0, $result->score);
    }

    public function test_score_clamped_to_100(): void
    {
        $scorer = $this->makeScorer();

        $score = $scorer->score('bad.xyz', null, null);
        $this->assertLessThanOrEqual(100, $score->score);
    }

    public function test_breakdown_sum_equals_total_score(): void
    {
        $scorer = $this->makeScorer();

        $geo = new GeoResult(
            status: 'success',
            query: '1.2.3.4',
            proxy: true,
            hosting: true
        );

        $result = $scorer->score('example.xyz', '1.2.3.4', $geo);

        $breakdownSum = array_reduce(
            $result->breakdown,
            fn (int $sum, array $item) => $sum + $item['weight'],
            0
        );

        $clampedBreakdownSum = max(0, min(100, $breakdownSum));

        if ($result->score === 100) {
            $this->assertGreaterThanOrEqual(100, $breakdownSum);
        } elseif ($result->score === 0) {
            $this->assertLessThanOrEqual(0, $breakdownSum);
        } else {
            $this->assertEquals($result->score, $clampedBreakdownSum);
        }
    }

    public function test_null_geo_results_in_unknown_for_low_risk(): void
    {
        $scorer = $this->makeScorer();

        $result = $scorer->score('good-site.com', null, null);

        $this->assertInstanceOf(RiskScoreResult::class, $result);
        $this->assertEquals('LOW', $result->level);
    }

    public function test_returns_risk_score_result(): void
    {
        $scorer = $this->makeScorer();

        $result = $scorer->score('example.com', '1.2.3.4', null);

        $this->assertInstanceOf(RiskScoreResult::class, $result);
        $this->assertIsInt($result->score);
        $this->assertContains($result->level, ['LOW', 'MEDIUM', 'HIGH']);
        $this->assertIsArray($result->breakdown);
        $this->assertIsInt($result->flagCount);
    }

    public function test_to_array_returns_expected_keys(): void
    {
        $scorer = $this->makeScorer();

        $result = $scorer->score('example.com', '1.2.3.4', null);
        $array = $result->toArray();

        $this->assertArrayHasKey('score', $array);
        $this->assertArrayHasKey('level', $array);
        $this->assertArrayHasKey('breakdown', $array);
        $this->assertArrayHasKey('flag_count', $array);
    }

    private function makeScorer(): RiskScorer
    {
        return new RiskScorer(
            new BlocklistChecker,
            new DomainReputationChecker,
            $this->knownServices,
            new TyposquattingDetector($this->knownServices)
        );
    }
}
