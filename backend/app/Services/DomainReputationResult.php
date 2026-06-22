<?php

namespace App\Services;

class DomainReputationResult
{
    /**
     * @param  ?int  $domainAgeDays  Domain age in days (null if WHOIS failed)
     * @param  ?bool  $sslValid  Whether the domain has a valid SSL certificate
     * @param  bool  $suspiciousTld  Whether the TLD is in the suspicious list
     * @param  ?string  $error  Error message if checks failed
     */
    public function __construct(
        public ?int $domainAgeDays = null,
        public ?bool $sslValid = null,
        public bool $suspiciousTld = false,
        public ?string $error = null
    ) {}

    public function hasValidSsl(): bool
    {
        return $this->sslValid === true;
    }
}
