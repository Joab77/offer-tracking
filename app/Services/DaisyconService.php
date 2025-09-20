<?php

namespace App\Services;

use App\Models\Offer;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DaisyconService
{
    private const BASE_URL = 'https://services.daisycon.com';
    private $accessToken;
    private $publisherId;

    public function __construct()
    {
        $this->publisherId = Setting::get('daisycon_publisher_id');
    }

    public function authenticate(): bool
    {
        try {
            $username = Setting::get('daisycon_username');
            $password = Setting::get('daisycon_password');

            if (!$username || !$password || !$this->publisherId) {
                Log::error('Daisycon credentials not configured');
                return false;
            }

            $response = Http::post(self::BASE_URL . '/login', [
                'username' => $username,
                'password' => $password,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $this->accessToken = $data['access_token'] ?? null;

                if ($this->accessToken) {
                    // Stocker le token temporairement (optionnel)
                    Setting::set('daisycon_access_token', $this->accessToken, 'Token d\'accès temporaire', true);
                    return true;
                }
            }

            Log::error('Daisycon authentication failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('Daisycon authentication exception', [
                'message' => $e->getMessage(),
            ]);
            return false;
        }
    }

    public function testConnection(): array
    {
        if (!$this->authenticate()) {
            return [
                'success' => false,
                'message' => 'Échec de l\'authentification'
            ];
        }

        try {
            $response = Http::withToken($this->accessToken)
                ->get(self::BASE_URL . "/publishers/{$this->publisherId}/transactions", [
                    'limit' => 1
                ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Connexion réussie à l\'API Daisycon'
                ];
            }

            return [
                'success' => false,
                'message' => 'Erreur lors du test de connexion: ' . $response->status()
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Exception: ' . $e->getMessage()
            ];
        }
    }

    public function getTransactions(int $page = 1, int $limit = 100): array
    {
        try {
            if (!$this->accessToken && !$this->authenticate()) {
                return [];
            }

            $response = Http::withToken($this->accessToken)->get(
                self::BASE_URL . "/publishers/{$this->publisherId}/transactions",
                [
                    'page' => $page,
                    'limit' => $limit,
                ]
            );

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Erreur API Daisycon transactions', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error('Exception lors de l\'appel API Daisycon transactions', [
                'message' => $e->getMessage(),
            ]);

            return [];
        }
    }

    public function syncOffers(): int
    {
        if (!$this->authenticate()) {
            Log::error('Impossible de s\'authentifier à Daisycon pour la sync des offres');
            return 0;
        }

        $updatedCount = 0;
        $page = 1;
        $hasMorePages = true;

        while ($hasMorePages) {
            $transactions = $this->getTransactions($page);

            if (empty($transactions['data'])) {
                $hasMorePages = false;
                continue;
            }

            foreach ($transactions['data'] as $transaction) {
                if ($this->updateOfferFromTransaction($transaction)) {
                    $updatedCount++;
                }
            }

            // Vérifier s'il y a d'autres pages
            $hasMorePages = isset($transactions['pagination']['has_next']) && $transactions['pagination']['has_next'];
            $page++;

            // Limite de sécurité pour éviter les boucles infinies
            if ($page > 100) {
                Log::warning('Limite de pages atteinte lors de la sync des offres Daisycon');
                break;
            }
        }

        Log::info("Synchronisation des offres Daisycon terminée", [
            'offers_updated' => $updatedCount
        ]);

        return $updatedCount;
    }

    private function updateOfferFromTransaction(array $transaction): bool
    {
        try {
            $programId = $transaction['program_id'] ?? null;
            $programName = $transaction['program_name'] ?? null;

            if (!$programId) {
                return false;
            }

            // Chercher l'offre correspondante par program_id
            $offer = Offer::where('program_id', $programId)->first();

            if (!$offer) {
                Log::info('Offre non trouvée pour program_id: ' . $programId);
                return false;
            }

            // Traiter chaque part de la transaction pour mettre à jour l'offre
            foreach ($transaction['parts'] as $part) {
                $this->updateOfferFromPart($offer, $transaction, $part);
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour de l\'offre', [
                'transaction' => $transaction,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    private function updateOfferFromPart(Offer $offer, array $transaction, array $part): void
    {
        // Mapper le statut Daisycon vers notre système
        $status = $this->mapDaisyconStatus($part['status'] ?? 'pending');

        // Mettre à jour les données de l'offre
        $offerData = [
            'status' => $status,
            'commission' => $part['commission'] ?? $offer->commission,
            'currency_code' => $part['currency_code'] ?? $offer->currency_code,
            'program_id' => $transaction['program_id'] ?? null,
            'program_name' => $transaction['program_name'] ?? null,
            'last_updated_daisycon' => isset($part['last_modified']) ?
                \Carbon\Carbon::parse($part['last_modified']) : now(),
            'raw_data' => [
                'transaction' => $transaction,
                'part' => $part
            ]
        ];

        // Mettre à jour l'offre
        $offer->update($offerData);
        Log::info('Offre mise à jour', ['offer_id' => $offer->id, 'program_id' => $transaction['program_id']]);
    }

    private function mapDaisyconStatus(string $daisyconStatus): string
    {
        return match (strtolower($daisyconStatus)) {
            'approved' => 'approved',
            'disapproved' => 'disapproved',
            'pending' => 'pending',
            default => 'pending',
        };
    }

    public function getLastSyncInfo(): array
    {
        $lastSync = Setting::get('daisycon_last_sync');
        $lastSyncCount = Setting::get('daisycon_last_sync_count', 0);

        return [
            'last_sync' => $lastSync ? \Carbon\Carbon::parse($lastSync) : null,
            'last_sync_count' => (int) $lastSyncCount,
        ];
    }

    public function updateSyncInfo(int $syncedCount): void
    {
        Setting::set('daisycon_last_sync', now()->toISOString(), 'Dernière synchronisation des offres Daisycon');
        Setting::set('daisycon_last_sync_count', $syncedCount, 'Nombre d\'offres mises à jour');
    }
}
