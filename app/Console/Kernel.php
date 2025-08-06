<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected $commands = [
        Commands\SyncDaisyconData::class,
    ];

    protected function schedule(Schedule $schedule): void
    {
        // Synchronisation avec Daisycon toutes les heures
        $schedule->command('daisycon:sync')
                 ->hourly()
                 ->withoutOverlapping()
                 ->runInBackground();
    }

    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}