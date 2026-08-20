<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\MasterLabour;
use App\Models\MasterMaterial;
use App\Models\Organization;
use App\Models\PurchaseOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_seeds_a_super_admin_account(): void
    {
        $this->seed();

        $superAdmin = User::query()->where('email', 'superadmin@example.com')->first();

        $this->assertNotNull($superAdmin);
        $this->assertSame('Super Admin', $superAdmin->name);
        $this->assertSame(UserRole::SuperAdmin, $superAdmin->role);
        $this->assertTrue($superAdmin->isSuperAdmin());
        $this->assertNotNull($superAdmin->email_verified_at);
        $this->assertSame(335, MasterLabour::query()->count());
        $this->assertSame(351, MasterMaterial::query()->count());
        $this->assertSame(2809, PurchaseOrder::query()->count());
        $this->assertTrue(Organization::query()->where('singleton', 1)->exists());
    }

    public function test_seeded_super_admin_can_authenticate(): void
    {
        $this->seed();

        $response = $this->post(route('login.store'), [
            'email' => 'superadmin@example.com',
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_default_to_the_member_role(): void
    {
        $user = User::factory()->create();

        $this->assertSame(UserRole::Member, $user->role);
        $this->assertFalse($user->isSuperAdmin());
    }

    public function test_super_admin_factory_state(): void
    {
        $user = User::factory()->superAdmin()->create();

        $this->assertTrue($user->isSuperAdmin());
    }
}
