<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Risk Scoring Weights
    |--------------------------------------------------------------------------
    |
    | Each signal contributes a weighted score to the total risk assessment.
    | Higher weights indicate stronger risk indicators. known_service_bonus
    | is subtracted (it reduces risk).
    |
    */

    'weights' => [
        'proxy' => 25,
        'hosting' => 8,
        'on_blocklist' => 40,
        'domain_age_under_7_days' => 35,
        'domain_age_under_30_days' => 25,
        'domain_age_under_90_days' => 15,
        'no_valid_ssl' => 20,
        'suspicious_tld' => 10,
        'typosquatting' => 35,
        'known_service_bonus' => 30,
    ],

    /*
    |--------------------------------------------------------------------------
    | Risk Level Thresholds
    |--------------------------------------------------------------------------
    |
    | Scores at or above 'high' are HIGH risk. Scores at or above 'medium'
    | are MEDIUM risk. Anything below 'medium' is LOW risk.
    |
    */

    'thresholds' => [
        'high' => 65,
        'medium' => 30,
    ],

    /*
    |--------------------------------------------------------------------------
    | Blocklist Provider Configuration
    |--------------------------------------------------------------------------
    |
    | Each provider can be independently enabled/disabled. API keys are
    | loaded from environment variables. Timeout is in milliseconds.
    | All providers are default-disabled (opt-in for security scanning).
    |
    */

    'blocklist' => [
        'google_safe_browsing' => [
            'enabled' => env('GSB_ENABLED', false),
            'api_key' => env('GSB_API_KEY', ''),
            'timeout' => 5000,
        ],
        'phishtank' => [
            'enabled' => env('PHISHTANK_ENABLED', false),
            'api_key' => env('PHISHTANK_API_KEY', ''),
            'timeout' => 5000,
        ],
        'virustotal' => [
            'enabled' => env('VIRUSTOTAL_ENABLED', false),
            'api_key' => env('VIRUSTOTAL_API_KEY', ''),
            'timeout' => 5000,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | WHOIS Configuration
    |--------------------------------------------------------------------------
    |
    | Timeout for WHOIS lookups in milliseconds. WHOIS can be slow on some
    | TLDs, so this should be reasonably short.
    |
    */

    'whois' => [
        'timeout' => 5000,
    ],

    /*
    |--------------------------------------------------------------------------
    | Suspicious TLDs
    |--------------------------------------------------------------------------
    |
    | These TLDs are frequently associated with malicious or suspicious
    | activity and contribute additional risk points when detected.
    |
    */

    'suspicious_tlds' => [
        '.xyz', '.top', '.gq', '.ml', '.tk', '.cf',
        '.click', '.download', '.review', '.work', '.date',
        '.faith', '.men', '.loan', '.win', '.bid',
    ],

    /*
    |--------------------------------------------------------------------------
    | Whois Server Map
    |--------------------------------------------------------------------------
    |
    | Mapping of TLDs to their WHOIS servers for domain age lookups.
    | Falls back to whois.iana.org for unlisted TLDs.
    |
    */

    'whois_servers' => [
        'com' => 'whois.verisign-grs.com',
        'net' => 'whois.verisign-grs.com',
        'org' => 'whois.pir.org',
        'io' => 'whois.nic.io',
        'dev' => 'whois.nic.google',
        'app' => 'whois.nic.google',
        'co' => 'whois.nic.co',
        'uk' => 'whois.nic.uk',
        'de' => 'whois.denic.de',
        'fr' => 'whois.nic.fr',
        'ca' => 'whois.cira.ca',
    ],

];
