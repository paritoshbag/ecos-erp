<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $superAdmin = User::query()->firstOrNew([
            'email' => 'superadmin@example.com',
        ]);

        $superAdmin->forceFill([
            'name' => 'Super Admin',
            'password' => 'password',
            'email_verified_at' => now(),
            'role' => UserRole::SuperAdmin,
        ])->save();

        Organization::current();

        $this->call([
            MasterLabourSeeder::class,
            MasterMaterialSeeder::class,
            PurchaseOrderSeeder::class,
        ]);
    }
}
