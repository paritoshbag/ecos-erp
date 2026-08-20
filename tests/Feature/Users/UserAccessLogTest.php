<?php

namespace Tests\Feature\Users;

use App\Models\User;
use App\Models\UserAccessLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class UserAccessLogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_successful_login_is_recorded_for_the_user(): void
    {
        $user = User::factory()->create();

        $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'password',
        ])->assertRedirect(route('dashboard', absolute: false));

        $log = UserAccessLog::query()
            ->where('user_id', $user->id)
            ->where('event', 'login')
            ->first();

        $this->assertNotNull($log);
        $this->assertSame('POST', $log->method);
        $this->assertNotNull($log->ip_address);
    }

    public function test_mutating_requests_store_a_sanitized_payload(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)->post(route('users.store'), [
            'name' => 'Logged User',
            'email' => 'logged@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $log = UserAccessLog::query()
            ->where('user_id', $admin->id)
            ->where('event', 'http.request')
            ->where('route_name', 'users.store')
            ->first();

        $this->assertNotNull($log);
        $this->assertIsArray($log->payload);
        $this->assertSame('[redacted]', $log->payload['password'] ?? null);
        $this->assertSame('[redacted]', $log->payload['password_confirmation'] ?? null);
        $this->assertSame('Logged User', $log->payload['name'] ?? null);
    }

    public function test_members_cannot_read_another_users_access_log(): void
    {
        $member = User::factory()->create();
        $other = User::factory()->create();

        UserAccessLog::factory()->for($other)->create([
            'event' => 'login',
        ]);

        $this->actingAs($member)
            ->get(route('users.show', $other))
            ->assertForbidden();
    }

    public function test_super_admin_can_read_a_users_access_log(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $member = User::factory()->create();

        UserAccessLog::factory()->for($member)->create([
            'event' => 'login',
            'ip_address' => '203.0.113.10',
        ]);

        $this->actingAs($admin)
            ->get(route('users.show', $member))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('users/show')
                ->has('accessLogs.data', 1)
                ->where('accessLogs.data.0.event', 'login')
                ->where('accessLogs.data.0.ip_address', '203.0.113.10')
            );
    }

    public function test_disabled_login_is_recorded_as_failed(): void
    {
        $user = User::factory()->disabled()->create();

        $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertTrue(
            UserAccessLog::query()
                ->where('user_id', $user->id)
                ->where('event', 'login_failed')
                ->exists(),
        );
    }
}
