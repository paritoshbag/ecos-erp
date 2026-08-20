<?php

namespace Tests\Feature\Drive;

use App\Models\DriveItem;
use App\Models\User;
use Illuminate\Http\UploadedFile;

class DriveAuthorizationTest extends DriveTestCase
{
    public function test_members_cannot_rename_someone_elses_file(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $file = DriveItem::factory()->file()->for($owner, 'owner')->create(['name' => 'locked.txt']);

        $this->actingAs($member)
            ->patch(route('drive.items.update', $file), ['name' => 'hacked.txt'])
            ->assertForbidden();

        $this->assertSame('locked.txt', $file->refresh()->name);
    }

    public function test_members_cannot_upload_into_someone_elses_folder(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $folder = DriveItem::factory()->for($owner, 'owner')->create();

        $this->actingAs($member)
            ->post(route('drive.files.store'), [
                'parent_id' => $folder->id,
                'file' => UploadedFile::fake()->create('intruder.txt', 10, 'text/plain'),
            ])
            ->assertForbidden();
    }

    public function test_super_admins_can_rename_any_item(): void
    {
        $owner = User::factory()->create();
        $admin = User::factory()->superAdmin()->create();
        $file = DriveItem::factory()->file()->for($owner, 'owner')->create(['name' => 'locked.txt']);

        $this->actingAs($admin)
            ->patch(route('drive.items.update', $file), ['name' => 'unlocked.txt'])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertSame('unlocked.txt', $file->refresh()->name);
    }

    public function test_members_cannot_purge_someone_elses_trashed_file(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $file = DriveItem::factory()->file()->for($owner, 'owner')->create();
        $file->delete();

        $this->actingAs($member)
            ->delete(route('drive.items.purge', $file))
            ->assertForbidden();
    }

    public function test_editors_cannot_be_granted_to_the_owner(): void
    {
        $owner = User::factory()->create();
        $file = DriveItem::factory()->file()->for($owner, 'owner')->create();

        $this->actingAs($owner)
            ->from(route('drive.index'))
            ->post(route('drive.shares.store', $file), ['email' => $owner->email])
            ->assertRedirect(route('drive.index'))
            ->assertSessionHasErrors('email');
    }

    public function test_members_cannot_share_someone_elses_item(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $other = User::factory()->create();
        $file = DriveItem::factory()->file()->for($owner, 'owner')->create();

        $this->actingAs($member)
            ->post(route('drive.shares.store', $file), ['email' => $other->email])
            ->assertForbidden();
    }
}
