<?php

namespace Tests\Feature\Drive;

use App\Enums\DrivePermission;
use App\Models\DriveItem;
use App\Models\DriveShare;
use App\Models\User;
use Illuminate\Http\UploadedFile;

class DriveShareTest extends DriveTestCase
{
    public function test_owners_can_grant_editor_access_by_email(): void
    {
        $owner = User::factory()->create();
        $editor = User::factory()->create();
        $folder = DriveItem::factory()->for($owner, 'owner')->create();

        $this->actingAs($owner)
            ->post(route('drive.shares.store', $folder), ['email' => $editor->email])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertTrue(
            DriveShare::query()
                ->where('drive_item_id', $folder->id)
                ->where('user_id', $editor->id)
                ->where('permission', DrivePermission::Editor)
                ->exists(),
        );
    }

    public function test_folder_editors_inherit_write_access_to_children(): void
    {
        $owner = User::factory()->create();
        $editor = User::factory()->create();
        $folder = DriveItem::factory()->for($owner, 'owner')->create();
        DriveShare::factory()->for($folder, 'item')->for($editor, 'user')->create();

        $this->actingAs($editor)
            ->post(route('drive.files.store'), [
                'parent_id' => $folder->id,
                'file' => UploadedFile::fake()->create('notes.txt', 10, 'text/plain'),
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertTrue(DriveItem::query()->where('name', 'notes.txt')->where('parent_id', $folder->id)->exists());
    }

    public function test_owners_can_remove_editor_access(): void
    {
        $owner = User::factory()->create();
        $editor = User::factory()->create();
        $folder = DriveItem::factory()->for($owner, 'owner')->create();
        $share = DriveShare::factory()->for($folder, 'item')->for($editor, 'user')->create();

        $this->actingAs($owner)
            ->delete(route('drive.shares.destroy', $share))
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertModelMissing($share);
    }
}
