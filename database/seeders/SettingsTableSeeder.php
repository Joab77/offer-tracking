<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsTableSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            [
                'key' => 'daisycon_publisher_id',
                'value' => null,
                'description' => 'ID Publisher Daisycon',
            ],
            [
                'key' => 'daisycon_username',
                'value' => null,
                'description' => 'Nom d\'utilisateur Daisycon',
            ],
            [
                'key' => 'daisycon_password',
                'value' => null,
                'description' => 'Mot de passe Daisycon',
                'is_encrypted' => true,
            ],
        ];

        foreach ($settings as $data) {
            Setting::updateOrCreate(
                ['key' => $data['key']], // clé unique
                $data
            );
        }

        $this->command->info('✅ Paramètres Daisycon créés ou mis à jour avec succès.');
    }
}
