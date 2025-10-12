<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Offer;
use App\Models\Participation;
use Carbon\Carbon;

class ParticipationsForUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find or create a demo user
        $user = User::firstWhere('email', 'demo.user@example.com');
        if (! $user) {
            $user = User::create([
                'name' => 'Demo User',
                'email' => 'demo.user@example.com',
                'password' => bcrypt('password'),
                'validated' => true,
            ]);
        }

        // Target number of participations for the demo user
        $targetParticipations = 50;

        // Ensure there are at least $targetParticipations offers; create more if necessary
        $offers = Offer::all();
        $existingOfferCount = $offers->count();
        if ($existingOfferCount < $targetParticipations) {
            for ($i = $existingOfferCount; $i < $targetParticipations; $i++) {
                $offers->push(Offer::create([
                    'title' => "Demo Offer #" . ($i + 1),
                    'description' => 'Offre de démonstration',
                    'deeplink' => 'https://example.com/click',
                    'country' => 'FR',
                    'image_url' => null,
                    'program_id' => 1000 + $i,
                ]));
            }
        }

        // Refresh collection and limit to target
        $offers = Offer::take($targetParticipations)->get()->values();

        $statuses = ['open', 'approved', 'disapproved', 'open', 'approved', 'approved', 'open'];

        // Count existing participations for this user and create until target reached
        $existingCount = Participation::where('user_id', $user->id)->count();
        $toCreate = max(0, $targetParticipations - $existingCount);
        $created = 0;

        foreach ($offers as $index => $offer) {
            if ($created >= $toCreate) {
                break;
            }

            // Skip if user already has participation for this offer (unique constraint)
            if ($offer->hasUserParticipated($user->id)) {
                $this->command->info("User already participated in offer {$offer->id}, skipping");
                continue;
            }

            // generate a varied date within the last 90 days
            $daysAgo = rand(0, 90);
            $minutesOffset = rand(0, 24 * 60);
            $txDate = Carbon::now()->subDays($daysAgo)->subMinutes($minutesOffset)->toIso8601String();

            Participation::create([
                'user_id' => $user->id,
                'offer_id' => $offer->id,
                'transaction_id' => 'TX-' . uniqid(),
                'status' => $statuses[$index % count($statuses)] ?? 'open',
                'commission' => rand(100, 500) / 10, // random commission 10.0 - 50.0
                'currency_code' => 'EUR',
                'raw_data' => [
                    'note' => 'Seeded participation for demo',
                    'transaction' => [
                        'date' => $txDate,
                    ],
                ],
                'created_at' => $txDate,
                'updated_at' => $txDate,
            ]);

            $created++;
            $this->command->info("Created participation for user {$user->email} on offer {$offer->id}");
        }

        $this->command->info("✅ Seeded $created participations (user had $existingCount existing; target $targetParticipations)");
    }
}
