<?php

namespace Tests\Feature;

use App\Models\Offer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_users(): void
    {
        $admin = User::factory()->admin()->create();
        $token = $admin->createToken('test-token')->plainTextToken;

        User::factory()->count(5)->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/admin/users');

        $response->assertStatus(200);
        $response->assertJsonStructure(['data', 'links', 'meta']);
    }

    public function test_non_admin_cannot_access_admin_routes(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/admin/users');

        $response->assertStatus(403);
    }

    public function test_admin_can_validate_user(): void
    {
        $admin = User::factory()->admin()->create();
        $token = $admin->createToken('test-token')->plainTextToken;
        $user = User::factory()->create(['validated' => false]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->patchJson("/api/admin/users/{$user->id}/validate");

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Utilisateur validé avec succès']);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'validated' => true,
        ]);
    }

    public function test_admin_can_create_offer(): void
    {
        $admin = User::factory()->admin()->create();
        $token = $admin->createToken('test-token')->plainTextToken;

        $offerData = [
            'title' => 'Nouvelle offre test',
            'description' => 'Description de l\'offre test',
            'commission' => 25.50,
            'country' => 'FR',
            'deeplink' => 'https://daisycon.io/click?a=123&c=456&p=789',
            'api_key' => 'test_api_key',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/admin/offers', $offerData);

        $response->assertStatus(201);
        $response->assertJson(['message' => 'Offre créée avec succès']);

        $this->assertDatabaseHas('offers', [
            'title' => 'Nouvelle offre test',
            'country' => 'FR',
        ]);
    }
}
