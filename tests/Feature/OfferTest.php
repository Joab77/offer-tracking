<?php

namespace Tests\Feature;

use App\Models\Offer;
use App\Models\Participation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OfferTest extends TestCase
{
    use RefreshDatabase;

    public function test_validated_user_can_view_offers_for_their_country(): void
    {
        $user = User::factory()->validated()->create(['pays' => 'FR']);
        $token = $user->createToken('test-token')->plainTextToken;

        // Créer des offres pour différents pays
        Offer::factory()->create(['country' => 'FR', 'title' => 'Offre France']);
        Offer::factory()->create(['country' => 'BE', 'title' => 'Offre Belgique']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/offers');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
        $response->assertJsonFragment(['title' => 'Offre France']);
        $response->assertJsonMissing(['title' => 'Offre Belgique']);
    }

    public function test_non_validated_user_cannot_view_offers(): void
    {
        $user = User::factory()->create(['validated' => false]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/offers');

        $response->assertStatus(403);
    }

    public function test_validated_user_can_apply_to_offer(): void
    {
        $user = User::factory()->validated()->create(['pays' => 'FR']);
        $token = $user->createToken('test-token')->plainTextToken;
        $offer = Offer::factory()->create(['country' => 'FR']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson("/api/offers/{$offer->id}/apply");

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'message',
            'participation',
            'affiliate_url'
        ]);

        $this->assertDatabaseHas('participations', [
            'user_id' => $user->id,
            'offer_id' => $offer->id,
            'status' => 'en_attente',
        ]);
    }

    public function test_user_cannot_apply_twice_to_same_offer(): void
    {
        $user = User::factory()->validated()->create(['pays' => 'FR']);
        $token = $user->createToken('test-token')->plainTextToken;
        $offer = Offer::factory()->create(['country' => 'FR']);

        // Première candidature
        Participation::factory()->create([
            'user_id' => $user->id,
            'offer_id' => $offer->id,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson("/api/offers/{$offer->id}/apply");

        $response->assertStatus(409);
        $response->assertJson(['message' => 'Vous avez déjà postulé à cette offre']);
    }
}