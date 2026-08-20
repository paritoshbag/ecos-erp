<?php

namespace Tests\Feature\Drive;

use App\Models\DriveItem;
use App\Models\User;

class DriveFolderTest extends DriveTestCase
{
    public function test_users_can_create_a_folder_at_the_root(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('drive.folders.store'), ['name' => 'Projects'])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $folder = DriveItem::query()->where('name', 'Projects')->first();

        $this->assertNotNull($folder);
        $this->assertTrue($folder->isFolder());
        $this->assertSame($user->id, $folder->user_id);
        $this->assertNull($folder->parent_id);
        $this->assertSame('/'.$folder->id.'/', $folder->path);
    }

    public function test_users_can_create_nested_folders_they_own(): void
    {
        $user = User::factory()->create();
        $parent = DriveItem::factory()->for($user, 'owner')->create(['name' => 'Parent']);

        $this->actingAs($user)
            ->post(route('drive.folders.store'), [
                'name' => 'Child',
                'parent_id' => $parent->id,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $child = DriveItem::query()->where('name', 'Child')->first();

        $this->assertNotNull($child);
        $this->assertSame($parent->id, $child->parent_id);
        $this->assertSame($parent->path.$child->id.'/', $child->path);
    }

    public function test_duplicate_names_in_the_same_folder_are_rejected(): void
    {
        $user = User::factory()->create();
        DriveItem::factory()->for($user, 'owner')->create(['name' => 'Reports']);

        $this->actingAs($user)
            ->from(route('drive.index'))
            ->post(route('drive.folders.store'), ['name' => 'Reports'])
            ->assertRedirect(route('drive.index'))
            ->assertSessionHasErrors('name');
    }

    public function test_users_can_rename_folders_they_own(): void
    {
        $user = User::factory()->create();
        $folder = DriveItem::factory()->for($user, 'owner')->create(['name' => 'Old']);

        $this->actingAs($user)
            ->patch(route('drive.items.update', $folder), ['name' => 'New'])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertSame('New', $folder->refresh()->name);
    }
}
