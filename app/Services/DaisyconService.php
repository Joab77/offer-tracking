<?php

namespace App\Services;

use App\Models\Participation;
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

    public function syncTransactions(): int
    {
        if (!$this->authenticate()) {
            Log::error('Impossible de s\'authentifier à Daisycon');
            return 0;
        }

        $syncedCount = 0;
        $page = 1;
        $hasMorePages = true;

        while ($hasMorePages) {
            $transactions = $this->getTransactions($page);

            if (empty($transactions['data'])) {
                $hasMorePages = false;
                continue;
            }

            foreach ($transactions['data'] as $transaction) {
                if ($this->processTransaction($transaction)) {
                    $syncedCount++;
                }
            }

            // Vérifier s'il y a d'autres pages
            $hasMorePages = isset($transactions['pagination']['has_next']) && $transactions['pagination']['has_next'];
            $page++;

            // Limite de sécurité pour éviter les boucles infinies
            if ($page > 100) {
                Log::warning('Limite de pages atteinte lors de la synchronisation Daisycon');
                break;
            }
        }

        Log::info("Synchronisation Daisycon terminée", [
            'transactions_synchronized' => $syncedCount
        ]);

        return $syncedCount;
    }

    private function processTransaction(array $transaction): bool
    {
        try {
            $affiliatemarketingId = $transaction['affiliatemarketing_id'] ?? null;

            if (!$affiliatemarketingId) {
                return false;
            }

            // Traiter chaque part de la transaction
            foreach ($transaction['parts'] as $part) {
                $this->processTransactionPart($transaction, $part);
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Erreur lors du traitement de la transaction', [
                'transaction' => $transaction,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    private function processTransactionPart(array $transaction, array $part): void
    {
        $affiliatemarketingId = $transaction['affiliatemarketing_id'];
        $partId = $part['id'];
        $uniqueId = $affiliatemarketingId . '_' . $partId;

        // Mapper le statut Daisycon vers notre système
        $status = $this->mapDaisyconStatus($part['status'] ?? 'pending');

        $participationData = [
            'affiliatemarketing_id' => $uniqueId,
            'program_id' => $transaction['program_id'] ?? null,
            'program_name' => $transaction['program_name'] ?? null,
            'status' => $status,
            'commission_earned' => $part['commission'] ?? 0,
            'currency_code' => $part['currency_code'] ?? 'EUR',
            'approval_date' => isset($part['approval_date']) ?
                \Carbon\Carbon::parse($part['approval_date']) : null,
            'disapproved_reason' => $part['disapproved_reason'] ?? null,
            'last_modified_daisycon' => isset($part['last_modified']) ?
                \Carbon\Carbon::parse($part['last_modified']) : now(),
            'raw_data' => [
                'transaction' => $transaction,
                'part' => $part
            ]
        ];

        // Chercher une participation existante
        $participation = Participation::where('affiliatemarketing_id', $uniqueId)->first();

        if ($participation) {
            // Mettre à jour la participation existante
            $participation->update($participationData);
            Log::info('Participation mise à jour', ['id' => $participation->id]);
        } else {
            // Créer une nouvelle participation
            // Note: user_id et offer_id peuvent être null si on ne peut pas les mapper
            $participationData['clicked_at'] = isset($part['date_click']) ?
                \Carbon\Carbon::parse($part['date_click']) : now();

            Participation::create($participationData);
            Log::info('Nouvelle participation créée', ['affiliatemarketing_id' => $uniqueId]);
        }
    }

    private function mapDaisyconStatus(string $daisyconStatus): string
    {
        return match (strtolower($daisyconStatus)) {
            'approved' => 'validee',
            'disapproved' => 'refusee',
            'pending' => 'en_attente',
            default => 'en_attente',
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
        Setting::set('daisycon_last_sync', now()->toISOString(), 'Dernière synchronisation Daisycon');
        Setting::set('daisycon_last_sync_count', $syncedCount, 'Nombre de transactions synchronisées');
    }
}
