<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class LocalisationService
{
    public function getCountryWithIP(string $ip): ?string
    {
        if($ip === '127.0.0.1' || $ip === 'localhost') {
            $ip = "8.7.8.11";
        }
        // Utilisation d'un service tiers pour obtenir le pays à partir de l'IP
        // Par exemple, ipapi.co, ipinfo.io, etc.
        // Ici, nous utilisons ipapi.co comme exemple

        $response = Http::post("https://ipinfo.io/{$ip}/json/");

        if ($response === false) {
            return null;
        }

        $data = json_decode($response, true);

        return $data['country'] ?? "FR";
    }
}
