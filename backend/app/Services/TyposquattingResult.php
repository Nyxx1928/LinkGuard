<?php

namespace App\Services;

class TyposquattingResult
{
    /**
     * @param  bool  $flagged  Whether the domain looks like typosquatting
     * @param  ?string  $matchedDomain  The known service domain this is squatting
     * @param  ?int  $distance  Levenshtein distance to the closest match
     */
    public function __construct(
        public bool $flagged = false,
        public ?string $matchedDomain = null,
        public ?int $distance = null
    ) {}
}
