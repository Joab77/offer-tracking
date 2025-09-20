<?php

namespace Database\Seeders;

use App\Models\Offer;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Créer un administrateur
        User::create([
            'name' => 'Admin',
            'email' => 'admin@test.com',
            'password' => Hash::make('password123'),
            'validated' => true,
            'is_admin' => true,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'User',
            'email' => 'user@test.com',
            'password' => Hash::make('password123'),
            'validated' => true,
            'is_admin' => false,
            'email_verified_at' => now(),
        ]);


        // Créer quelques offres de test
        Offer::create([
            'title' => 'Offre Amazon France',
            'description' => 'Gagnez des commissions en promouvant les produits Amazon',
            'image_url' => 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg',
            'commission' => 15.50,
            'country' => 'FR',
            'deeplink' => 'https://daisycon.io/click?a=123456&c=789&p=654',
        ]);

        Offer::create([
            'title' => 'Offre Booking.com',
            'description' => 'Commissions sur les réservations d\'hôtels',
            'image_url' => 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
            'commission' => 25.00,
            'country' => 'BJ',
            'deeplink' => 'https://daisycon.io/click?a=654321&c=987&p=321'
        ]);

        // Paramètres Daisycon par défaut (à configurer)
        \App\Models\Setting::create([
            'key' => 'daisycon_publisher_id',
            'value' => null,
            'description' => 'ID Publisher Daisycon',
        ]);

        \App\Models\Setting::create([
            'key' => 'daisycon_username',
            'value' => null,
            'description' => 'Nom d\'utilisateur Daisycon',
        ]);

        \App\Models\Setting::create([
            'key' => 'daisycon_password',
            'value' => null,
            'description' => 'Mot de passe Daisycon',
            'is_encrypted' => true,
        ]);

    }
}
