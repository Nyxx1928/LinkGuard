<?php

namespace App\Services;

class BlocklistResult
{
    /**
     * @param  bool  $found  Whether the domain appeared on any blocklist
     * @param  array  $sources  Array of source names that flagged the domain
     * @param  ?string  $error  Error message if all providers failed (null on success)
     */
    public function __construct(
        public bool $found = false,
        public array $sources = [],
        public ?string $error = null
    ) {}
}
