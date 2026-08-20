<?php

namespace Tests\Feature\Users;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    /**
     * @param  array<string, string>  $overrides
     * @return array<string, string>
     */
    private function validPayload(array $overrides = []): array
    {
        return [
            'name' => 'Pat Kumar',
            'email' => 'pat@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            ...$overrides,
        ];
    }

    public function test_guests_are_redirected_from_the_users_module(): void
    {
        $user = User::factory()->create();

        $this->get(route('users.index'))->assertRedirect(route('login'));
        $this->get(route('users.create'))->assertRedirect(route('login'));
        $this->get(route('users.show', $user))->assertRedirect(route('login'));
        $this->post(route('users.store'), $this->validPayload())->assertRedirect(route('login'));
        $this->patch(route('users.update', $user), [
            'name' => 'Renamed',
            'email' => $user->email,
        ])->assertRedirect(route('login'));
    }

    public function test_members_cannot_access_the_users_module(): void
    {
        $member = User::factory()->create();
        $other = User::factory()->create();

        $this->actingAs($member)->get(route('users.index'))->assertForbidden();
        $this->actingAs($member)->get(route('users.create'))->assertForbidden();
        $this->actingAs($member)->get(route('users.show', $other))->assertForbidden();
        $this->actingAs($member)
            ->post(route('users.store'), $this->validPayload())
            ->assertForbidden();
        $this->actingAs($member)
            ->patch(route('users.update', $other), [
                'name' => 'Renamed',
                'email' => $other->email,
            ])
            ->assertForbidden();

        $this->assertSame(2, User::query()->count());
    }

    public function test_super_admin_can_view_the_user_list(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $member = User::factory()->create(['name' => 'Site Member']);

        $this->actingAs($admin)
            ->get(route('users.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('users/index')
                ->has('users', 2)
                ->where('users.0.name', 'Site Member')
                ->where('users.1.id', $admin->id)
                ->where('users.1.can_disable', false)
                ->where('users.0.can_disable', true)
            );
    }

    public function test_super_admin_can_view_the_create_form(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->get(route('users.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('users/create')
                ->has('passwordRules')
            );
    }

    public function test_super_admin_can_create_a_member(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $response = $this->actingAs($admin)
            ->post(route('users.store'), $this->validPayload());

        $user = User::query()->where('email', 'pat@example.com')->first();

        $this->assertNotNull($user);
        $this->assertSame('Pat Kumar', $user->name);
        $this->assertSame(UserRole::Member, $user->role);
        $this->assertNotNull($user->email_verified_at);
        $this->assertFalse($user->is_disabled);
        $response->assertRedirect(route('users.show', $user));
    }

    public function test_create_user_validates_unique_email_and_password_confirmation(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $existing = User::factory()->create(['email' => 'taken@example.com']);

        $this->actingAs($admin)
            ->post(route('users.store'), $this->validPayload([
                'email' => $existing->email,
                'password_confirmation' => 'mismatch',
            ]))
            ->assertSessionHasErrors(['email', 'password']);

        $this->assertSame(2, User::query()->count());
    }

    public function test_emails_are_stored_lowercase(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->post(route('users.store'), $this->validPayload([
                'email' => 'Pat@Example.COM',
            ]))
            ->assertRedirect();

        $this->assertNotNull(User::query()->where('email', 'pat@example.com')->first());
    }

    public function test_super_admin_can_view_and_update_a_user(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $member = User::factory()->create(['name' => 'Old Name']);

        $this->actingAs($admin)
            ->get(route('users.show', $member))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('users/show')
                ->where('user.id', $member->id)
                ->where('user.name', 'Old Name')
                ->has('accessLogs.data')
            );

        $this->actingAs($admin)
            ->patch(route('users.update', $member), [
                'name' => 'New Name',
                'email' => 'new@example.com',
            ])
            ->assertRedirect(route('users.show', $member));

        $member->refresh();

        $this->assertSame('New Name', $member->name);
        $this->assertSame('new@example.com', $member->email);
    }
}
