<?php

namespace App\Services;

class RiskScoreResult
{
    /**
     * @param  int  $score  Numeric risk score (0-100)
     * @param  string  $level  Risk level: 'LOW', 'MEDIUM', or 'HIGH'
     * @param  array  $breakdown  Array of contributing factors with { signal, weight, description }
     * @param  int  $flagCount  Number of flagged signals
     */
    public function __construct(
        public int $score,
        public string $level,
        public array $breakdown = [],
        public int $flagCount = 0
    ) {}

    public function toArray(): array
    {
        return [
            'score' => $this->score,
            'level' => $this->level,
            'breakdown' => $this->breakdown,
            'flag_count' => $this->flagCount,
        ];
    }
}
