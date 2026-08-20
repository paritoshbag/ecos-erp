<?php

namespace Tests\Feature\Users;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UserAvatarTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        Storage::fake('public');
    }

    public function test_members_cannot_upload_an_avatar(): void
    {
        $member = User::factory()->create();
        $other = User::factory()->create();

        $this->actingAs($member)
            ->post(route('users.avatar.store', $other), [
                'avatar' => UploadedFile::fake()->image('face.jpg'),
            ])
            ->assertForbidden();
    }

    public function test_super_admin_can_upload_and_replace_an_avatar(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $member = User::factory()->create();
        $first = UploadedFile::fake()->image('one.jpg');

        $this->actingAs($admin)
            ->from(route('users.show', $member))
            ->post(route('users.avatar.store', $member), ['avatar' => $first])
            ->assertRedirect(route('users.show', $member));

        $member->refresh();

        $this->assertNotNull($member->avatar_path);
        Storage::disk('public')->assertExists($member->avatar_path);
        $this->assertNotNull($member->avatar);

        $previous = $member->avatar_path;
        $second = UploadedFile::fake()->image('two.png');

        $this->actingAs($admin)
            ->post(route('users.avatar.store', $member), ['avatar' => $second]);

        $member->refresh();

        $this->assertNotSame($previous, $member->avatar_path);
        Storage::disk('public')->assertMissing($previous);
        Storage::disk('public')->assertExists($member->avatar_path);
    }

    public function test_super_admin_can_remove_an_avatar(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $member = User::factory()->create();

        $this->actingAs($admin)
            ->post(route('users.avatar.store', $member), [
                'avatar' => UploadedFile::fake()->image('face.jpg'),
            ]);

        $path = $member->fresh()->avatar_path;

        $this->actingAs($admin)
            ->from(route('users.show', $member))
            ->delete(route('users.avatar.destroy', $member))
            ->assertRedirect(route('users.show', $member));

        $this->assertNull($member->fresh()->avatar_path);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_non_images_are_rejected(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $member = User::factory()->create();

        $this->actingAs($admin)
            ->post(route('users.avatar.store', $member), [
                'avatar' => UploadedFile::fake()->create('notes.txt', 20, 'text/plain'),
            ])
            ->assertSessionHasErrors('avatar');

        $this->assertNull($member->fresh()->avatar_path);
    }
}
