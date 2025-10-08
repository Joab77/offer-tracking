<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin',
                'email' => 'admin@test.com',
                'password' => Hash::make('password123'),
                'validated' => true,
                'is_admin' => true,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'User',
                'email' => 'user@test.com',
                'password' => Hash::make('password123'),
                'validated' => true,
                'is_admin' => false,
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $data) {
            User::updateOrCreate(
                ['email' => $data['email']],
                $data
            );
        }

        $this->command->info('✅ Utilisateurs créés ou mis à jour avec succès.');
    }
}
