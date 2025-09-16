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
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
            'pays' => 'FR',
            'validated' => true,
            'is_admin' => true,
            'email_verified_at' => now(),
        ]);

        // Créer quelques utilisateurs de test
        User::factory(10)->create();

        // Créer quelques offres de test
        Offer::create([
            'title' => 'Offre Amazon France',
            'description' => 'Gagnez des commissions en promouvant les produits Amazon',
            'image_url' => 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg',
            'commission' => 15.50,
            'country' => 'FR',
            'daisycon_url' => 'https://daisycon.io/click?a=123456&c=789&p=654',
            'api_key' => 'test_api_key_amazon_fr',
        ]);

        Offer::create([
            'title' => 'Offre Booking.com',
            'description' => 'Commissions sur les réservations d\'hôtels',
            'image_url' => 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
            'commission' => 25.00,
            'country' => 'FR',
            'daisycon_url' => 'https://daisycon.io/click?a=654321&c=987&p=321',
            'api_key' => 'test_api_key_booking_fr',
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
