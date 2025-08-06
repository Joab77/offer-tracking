<?php

namespace App\Console\Commands;

use App\Services\DaisyconService;
use Illuminate\Console\Command;

class SyncDaisyconData extends Command
{
    protected $signature = 'daisycon:sync';
    protected $description = 'Synchronise les données avec l\'API Daisycon';

    public function handle(DaisyconService $daisyconService): int
    {
        $this->info('Début de la synchronisation avec Daisycon...');

        try {
            $daisyconService->syncParticipations();
            $this->info('Synchronisation terminée avec succès.');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Erreur lors de la synchronisation : ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}