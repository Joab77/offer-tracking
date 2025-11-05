<?php

namespace App\Services;

use App\Models\Offer;
use App\Models\Participation;
use App\Models\Setting;
use App\Models\User;
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

            $response = Http::post(self::BASE_URL . '/authenticate', [
                'username' => $username,
                'password' => $password,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $this->accessToken = $data ?? null;

                if ($this->accessToken) {
                    // Stocker le token temporairement (optionnel)
                    $s = Setting::set('daisycon_access_token', $this->accessToken, 'Token d\'accès temporaire', true);
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
                    'limit' => 1,
                    'start' => now()->subMonth()->format('Y-m-d H:i:s'),
                    'end'   => now()->format('Y-m-d H:i:s'),
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

    public function getTransactions(int $page = 1, int $limit = 1000): array
    {
        
        try {
            if (!$this->accessToken && !$this->authenticate()) {
                return [];
            }

            $allTransactions = [];
            $hasMore = true;

            while ($hasMore) {
                $params = [
                    'page' => $page,
                    'per_page' => $limit,
                    'start' => now()->subMonths(3)->format('Y-m-d H:i:s'),
                    'end'   => now()->endOfMonth()->format('Y-m-d H:i:s'),
                    'order_by' => 'date',
                    'order_direction' => 'desc'
                ];

                $response = Http::withToken($this->accessToken)->get(
                    self::BASE_URL . "/publishers/{$this->publisherId}/transactions",
                    $params
                );

                if (!$response->successful()) {
                    Log::error('Erreur API Daisycon transactions', [
                        'status' => $response->status(),
                        'body' => $response->body(),
                        'page' => $page,
                    ]);
                    break;
                }

                $data = $response->json() ?? [];
                 
                $allTransactions = array_merge($allTransactions, $data);


              
                // Récupération des infos de pagination depuis les headers
                $perPage = (int) $response->header('X-Paginator-Per-Page', $limit);
                $currentPage = (int) $response->header('X-Paginator-Page', $page);
                $totalCount = (int) $response->header('X-Total-Count', 0);

                // Calcul du nombre total de pages
                $totalPages = (int) ceil($totalCount / $perPage);

                Log::info("Pagination Daisycon", [
                    'page' => $currentPage,
                    'total_pages' => $totalPages,
                    'count' => count($data),
                ]);

                // Vérifie s'il reste d'autres pages
                $hasMore = $currentPage < $totalPages;

                if ($hasMore) {
                    $page++;
                    // Petite pause pour éviter d’éventuels rate limits
                    usleep(300000); // 0.3 seconde
                }
            }
           
            return $allTransactions;
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
            Log::error('Impossible de s\'authentifier à Daisycon pour la sync des transactions');
            return 0;
        }

        $updatedCount = 0;
        $page = 1;

        $transactions = $this->getTransactions($page);

        foreach ($transactions as $transaction) {
            if ($this->processTransaction($transaction)) {
                $updatedCount++;
            }
        }

        Log::info("Synchronisation des transactions Daisycon terminée", [
            'transactions_processed' => $updatedCount
        ]);

        return $updatedCount;
    }

    private function processTransaction(array $transaction): bool
    {
        $affiliatemarketingId = $transaction['affiliatemarketing_id'] ?? null;

        $programId = $transaction['program_id'] ?? null;

        if (!$affiliatemarketingId || !$programId) {
            Log::warning('Transaction incomplète', ['transaction' => $transaction]);
            return false;
        }

        $offer = $this->findOfferByProgramId($programId);

        if (!$offer) {
            Log::info('Offre non trouvée pour program_id: ' . $programId);
            return false;
        }

        foreach ($transaction['parts'] as &$part) {
            $part['commission'] = "1";
            $this->processTransactionPart($offer, $transaction, $part);
        }

        return true;
    }

    private function processTransactionPart(Offer $offer, array $transaction, array $part): void
    {
        
         // Créer un ID unique qui combine l'ID de transaction et l'ID de la part
        $transactionId = $transaction['affiliatemarketing_id'] . '_' . $part['id'];
              // Ajout de logs pour debug
              // Debug logs pour voir exactement ce que Daisycon envoie
   
        $transactionId = $transaction['affiliatemarketing_id'];

          $participationData = [
        'transaction_id' => $transactionId,
        'status' => $this->mapDaisyconStatus($part['status'] ?? ''),
        'commission' => $part['commission'] ?? "1",
        'currency_code' => $part['currency_code'] ?? "€",
        'date' => $transaction['date'],
        'raw_data' => [
            'transaction' => $transaction,
            'part' => $part,
        ],
        'offer_id' => $offer->id,
    ];


        if (!empty($part['subid'])) {
            $participationData['user_id'] = $part['subid'];
        }

// Log avant mise à jour
    Log::info('Status mapping', [
        'original_status' => $part['status'] ?? 'non défini',
        'mapped_status' => $participationData['status']
    ]);

        $participation = Participation::updateOrCreate(
            ['transaction_id' => $transactionId],
            $participationData
        );



        Log::info('Participation mise à jour', [
            'participation_id' => $participation->id,
            'transaction_id' => $transactionId,
        ]);

    }

    private function findOfferByProgramId(int $programId): ?Offer
    {
        return Offer::where('program_id', $programId)->first();
    }


    private function mapDaisyconStatus(string $daisyconStatus): string
    {
        return match (strtolower($daisyconStatus)) {
        'A', 'approved' => 'approved',
        'R', 'rejected', 'disapproved' => 'disapproved',
        'O', 'open', 'pending' => 'open',
        default => 'open'
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
        Setting::set('daisycon_last_sync', now()->toISOString(), 'Dernière synchronisation des transactions Daisycon');
        Setting::set('daisycon_last_sync_count', $syncedCount, 'Nombre de transactions traitées');
    }
}
