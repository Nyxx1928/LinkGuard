<?php

namespace App\Services;

class TyposquattingDetector
{
    private KnownServicesWhitelist $whitelist;

    public function __construct(KnownServicesWhitelist $whitelist)
    {
        $this->whitelist = $whitelist;
    }

    public function detect(string $domain): TyposquattingResult
    {
        $normalized = strtolower(trim($domain));

        if ($this->whitelist->isKnown($normalized)) {
            return new TyposquattingResult(flagged: false);
        }

        $extractedDomain = $this->extractMainDomain($normalized);
        $knownServices = $this->whitelist->getServices();

        $closestDistance = PHP_INT_MAX;
        $closestMatch = null;

        foreach ($knownServices as $known) {
            $knownMain = $this->extractMainDomain($known);

            if ($extractedDomain === $knownMain) {
                continue;
            }

            $distance = $this->levenshteinDistance($extractedDomain, $knownMain);
            if ($distance < $closestDistance) {
                $closestDistance = $distance;
                $closestMatch = $known;
            }
        }

        if ($closestDistance <= 2 && $closestMatch !== null) {
            return new TyposquattingResult(
                flagged: true,
                matchedDomain: $closestMatch,
                distance: $closestDistance
            );
        }

        return new TyposquattingResult(flagged: false);
    }

    private function extractMainDomain(string $domain): string
    {
        $parts = explode('.', $domain);
        $count = count($parts);

        if ($count <= 2) {
            return $domain;
        }

        return implode('.', array_slice($parts, $count - 2));
    }

    private function levenshteinDistance(string $a, string $b): int
    {
        $lenA = strlen($a);
        $lenB = strlen($b);

        if ($lenA === 0) {
            return $lenB;
        }
        if ($lenB === 0) {
            return $lenA;
        }

        $prev = range(0, $lenB);
        $curr = array_fill(0, $lenB + 1, 0);

        for ($i = 0; $i < $lenA; $i++) {
            $curr[0] = $i + 1;
            for ($j = 0; $j < $lenB; $j++) {
                $substitutionCost = ($a[$i] === $b[$j]) ? 0 : 1;
                $curr[$j + 1] = min(
                    $curr[$j] + 1,
                    $prev[$j + 1] + 1,
                    $prev[$j] + $substitutionCost
                );
            }
            $temp = $prev;
            $prev = $curr;
            $curr = $temp;
        }

        return $prev[$lenB];
    }
}
