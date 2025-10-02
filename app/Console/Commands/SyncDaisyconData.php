<?php

namespace App\Console\Commands;

use App\Services\DaisyconService;
use Illuminate\Console\Command;

class SyncDaisyconData extends Command
{
    protected $signature = 'daisycon:sync-transactions';
    protected $description = 'Synchronise les transactions avec l\'API Daisycon';

    public function handle(DaisyconService $daisyconService): int
    {
        $this->info('Début de la synchronisation des transactions avec Daisycon...');

        try {
            $updatedCount = $daisyconService->syncTransactions();
            $daisyconService->updateSyncInfo($syncedCount);

            $this->info("Synchronisation terminée avec succès. {$updatedCount} transactions traitées.");
            $this->info('Synchronisation terminée avec succès.');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Erreur lors de la synchronisation : ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
