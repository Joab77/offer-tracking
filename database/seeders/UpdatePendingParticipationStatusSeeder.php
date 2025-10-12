<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Participation;

class UpdatePendingParticipationStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $count = Participation::where('status', 'pending')
            ->orWhere('status', 'opened')
            ->update(['status' => 'open']);

        $this->command->info("✅ $count participations ont été mises à jour de 'pending' à 'open'.");
    }
}
