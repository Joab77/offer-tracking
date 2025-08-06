<?php

namespace App\Services;

use App\Models\Offer;
use App\Models\Participation;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DaisyconService
{
    private const BASE_URL = 'https://services.daisycon.com/publishers';

    public function getTransactions(string $apiKey, int $userId): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Accept' => 'application/json',
            ])->get(self::BASE_URL . '/stats/transactions/', [
                'subid' => 'user_' . $userId,
                'per_page' => 100,
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Erreur API Daisycon', [
                'status' => $response->status(),
                'body' => $response->body(),
                'user_id' => $userId,
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error('Exception lors de l\'appel API Daisycon', [
                'message' => $e->getMessage(),
                'user_id' => $userId,
            ]);

            return [];
        }
    }

    public function syncParticipations(): void
    {
        $participations = Participation::where('status', 'en_attente')
            ->with(['user', 'offer'])
            ->get();

        foreach ($participations as $participation) {
            $this->syncParticipation($participation);
        }
    }

    private function syncParticipation(Participation $participation): void
    {
        $offer = $participation->offer;
        
        if (!$offer->api_key) {
            Log::warning('Pas de clé API pour l\'offre', [
                'offer_id' => $offer->id,
                'participation_id' => $participation->id,
            ]);
            return;
        }

        $transactions = $this->getTransactions($offer->api_key, $participation->user_id);

        if (empty($transactions['data'])) {
            return;
        }

        foreach ($transactions['data'] as $transaction) {
            // Vérifier si la transaction correspond à cette participation
            if ($this->isTransactionForParticipation($transaction, $participation)) {
                $this->updateParticipationStatus($participation, $transaction);
                break;
            }
        }
    }

    private function isTransactionForParticipation(array $transaction, Participation $participation): bool
    {
        // Vérifier le subid
        $expectedSubid = 'user_' . $participation->user_id;
        
        if (isset($transaction['subid']) && $transaction['subid'] === $expectedSubid) {
            // Vérifier la date (la transaction doit être après le clic)
            if (isset($transaction['date'])) {
                $transactionDate = \Carbon\Carbon::parse($transaction['date']);
                return $transactionDate->greaterThanOrEqualTo($participation->clicked_at);
            }
            return true;
        }

        return false;
    }

    private function updateParticipationStatus(Participation $participation, array $transaction): void
    {
        $oldStatus = $participation->status;
        
        // Mapper le statut Daisycon vers notre statut
        $newStatus = match ($transaction['status'] ?? 'pending') {
            'approved', 'confirmed' => 'validee',
            'rejected', 'declined' => 'refusee',
            default => 'en_attente',
        };

        if ($oldStatus !== $newStatus) {
            $participation->update(['status' => $newStatus]);
            
            // Envoyer une notification si le statut a changé
            if ($newStatus !== 'en_attente') {
                $participation->user->notify(
                    new \App\Notifications\ParticipationStatusChangedNotification($participation, $oldStatus)
                );
            }

            Log::info('Statut de participation mis à jour', [
                'participation_id' => $participation->id,
                'user_id' => $participation->user_id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
            ]);
        }
    }
}