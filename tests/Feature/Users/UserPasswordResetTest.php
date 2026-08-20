<?php

namespace Tests\Feature\Users;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Fortify\Features;
use Tests\TestCase;

class UserPasswordResetTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->skipUnlessFortifyHas(Features::resetPasswords());
    }

    public function test_members_cannot_send_a_password_reset(): void
    {
        Notification::fake();

        $member = User::factory()->create();
        $other = User::factory()->create();

        $this->actingAs($member)
            ->post(route('users.password-reset', $other))
            ->assertForbidden();

        Notification::assertNothingSent();
    }

    public function test_super_admin_can_send_a_password_reset_email(): void
    {
        Notification::fake();

        $admin = User::factory()->superAdmin()->create();
        $member = User::factory()->create();

        $this->actingAs($admin)
            ->from(route('users.show', $member))
            ->post(route('users.password-reset', $member))
            ->assertRedirect(route('users.show', $member));

        Notification::assertSentTo($member, ResetPassword::class);
    }

    public function test_password_reset_cannot_be_sent_to_a_disabled_user(): void
    {
        Notification::fake();

        $admin = User::factory()->superAdmin()->create();
        $member = User::factory()->disabled()->create();

        $this->actingAs($admin)
            ->from(route('users.show', $member))
            ->post(route('users.password-reset', $member))
            ->assertRedirect(route('users.show', $member))
            ->assertSessionHasErrors('email');

        Notification::assertNothingSent();
    }
}
