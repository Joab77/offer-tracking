<?php

namespace App\Console\Commands;

use App\Services\DaisyconService;
use Illuminate\Console\Command;

class SyncDaisyconData extends Command
{
    protected $signature = 'daisycon:sync-offers';
    protected $description = 'Synchronise les offres avec l\'API Daisycon';

    public function handle(DaisyconService $daisyconService): int
    {
        $this->info('Début de la synchronisation des offres avec Daisycon...');

        try {
            $updatedCount = $daisyconService->syncOffers();
            $daisyconService->updateSyncInfo($updatedCount);

            $this->info("Synchronisation terminée avec succès. {$updatedCount} offres mises à jour.");
            $this->info('Synchronisation terminée avec succès.');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Erreur lors de la synchronisation : ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
