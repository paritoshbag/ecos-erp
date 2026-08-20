<?php

namespace Tests\Feature\Users;

use App\Actions\Users\ToggleUserDisabledAction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class UserDisableTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_members_cannot_toggle_disable(): void
    {
        $member = User::factory()->create();
        $other = User::factory()->create();

        $this->actingAs($member)
            ->patch(route('users.disabled', $other))
            ->assertForbidden();

        $this->assertFalse($other->fresh()->is_disabled);
    }

    public function test_super_admin_can_disable_and_enable_a_user(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $member = User::factory()->create();

        $this->actingAs($admin)
            ->from(route('users.show', $member))
            ->patch(route('users.disabled', $member))
            ->assertRedirect(route('users.show', $member));

        $this->assertTrue($member->fresh()->is_disabled);

        $this->actingAs($admin)
            ->from(route('users.show', $member))
            ->patch(route('users.disabled', $member))
            ->assertRedirect(route('users.show', $member));

        $this->assertFalse($member->fresh()->is_disabled);
    }

    public function test_super_admin_cannot_disable_themselves(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->patch(route('users.disabled', $admin))
            ->assertForbidden();

        $this->assertFalse($admin->fresh()->is_disabled);
    }

    public function test_the_last_enabled_superadmin_cannot_be_disabled(): void
    {
        $admin = User::factory()->superAdmin()->create();

        try {
            app(ToggleUserDisabledAction::class)->handle($admin);
            $this->fail('Expected the last superadmin disable to be rejected.');
        } catch (ValidationException $exception) {
            $this->assertArrayHasKey('user', $exception->errors());
        }

        $this->assertFalse($admin->fresh()->is_disabled);
    }

    public function test_disabled_users_cannot_authenticate(): void
    {
        $user = User::factory()->disabled()->create();

        $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'password',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_disabled_users_are_signed_out_of_existing_sessions(): void
    {
        $user = User::factory()->disabled()->create();

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertRedirect(route('login'));

        $this->assertGuest();
    }

    public function test_disabling_a_user_deletes_their_session_rows(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $member = User::factory()->create();

        DB::table('sessions')->insert([
            'id' => 'session-for-member',
            'user_id' => $member->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'PHPUnit',
            'payload' => 'test',
            'last_activity' => time(),
        ]);

        $this->actingAs($admin)->patch(route('users.disabled', $member));

        $this->assertDatabaseMissing('sessions', [
            'id' => 'session-for-member',
        ]);
    }
}
