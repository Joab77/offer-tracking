<?php

namespace Database\Seeders;

use App\Models\Offer;
use Illuminate\Database\Seeder;

class OffersTableSeeder extends Seeder
{
    public function run(): void
    {
        $offers = [
            [
                'title' => 'Offre Amazon France',
                'description' => 'Gagnez des commissions en promouvant les produits Amazon',
                'image_url' => 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg',
                'commission' => 15.50,
                'country' => 'FR',
                'deeplink' => 'https://daisycon.io/click?a=123456&c=789&p=654',
            ],
            [
                'title' => 'Offre Booking.com',
                'description' => 'Commissions sur les réservations d\'hôtels',
                'image_url' => 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
                'commission' => 25.00,
                'country' => 'BJ',
                'deeplink' => 'https://daisycon.io/click?a=654321&c=987&p=321',
            ],
        ];

        foreach ($offers as $data) {
            Offer::updateOrCreate(
                ['title' => $data['title']], // clé unique pour éviter doublon
                $data
            );
        }

        $this->command->info('✅ Offres créées ou mises à jour avec succès.');
    }
}
