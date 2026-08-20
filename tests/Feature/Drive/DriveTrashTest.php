<?php

namespace Tests\Feature\Drive;

use App\Models\DriveItem;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

class DriveTrashTest extends DriveTestCase
{
    public function test_owners_can_move_items_to_trash(): void
    {
        $user = User::factory()->create();
        $folder = DriveItem::factory()->for($user, 'owner')->create();
        $file = DriveItem::factory()->file()->for($user, 'owner')->in($folder)->create();

        $this->actingAs($user)
            ->delete(route('drive.items.destroy', $folder))
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertSoftDeleted($folder);
        $this->assertSoftDeleted($file);
    }

    public function test_owners_can_restore_trashed_items(): void
    {
        $user = User::factory()->create();
        $folder = DriveItem::factory()->for($user, 'owner')->create();
        $folder->subtree()->delete();

        $this->actingAs($user)
            ->post(route('drive.items.restore', $folder))
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertFalse($folder->refresh()->trashed());
    }

    public function test_owners_can_permanently_delete_trashed_files(): void
    {
        $user = User::factory()->create();
        $file = DriveItem::factory()->file('gone')->for($user, 'owner')->create();
        $key = $file->key;
        $file->delete();

        $this->actingAs($user)
            ->delete(route('drive.items.purge', $file))
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertNull(DriveItem::withTrashed()->find($file->id));
        Storage::disk(config('drive.disk'))->assertMissing($key);
    }

    public function test_owners_can_view_trash(): void
    {
        $user = User::factory()->create();
        $file = DriveItem::factory()->file()->for($user, 'owner')->create(['name' => 'trashed.txt']);
        $file->delete();

        $this->actingAs($user)
            ->get(route('drive.trash'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('drive/trash')
                ->has('items', 1)
                ->where('items.0.name', 'trashed.txt')
            );
    }

    public function test_restoring_when_the_parent_is_gone_moves_the_item_to_root(): void
    {
        $user = User::factory()->create();
        $folder = DriveItem::factory()->for($user, 'owner')->create();
        $file = DriveItem::factory()->file()->for($user, 'owner')->in($folder)->create();
        $file->delete();
        $folder->delete();

        $this->actingAs($user)
            ->post(route('drive.items.restore', $file))
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $file->refresh();

        $this->assertFalse($file->trashed());
        $this->assertNull($file->parent_id);
        $this->assertSame('/'.$file->id.'/', $file->path);
    }

    public function test_owners_can_empty_trash_after_typing_confirm(): void
    {
        $user = User::factory()->create();
        $folder = DriveItem::factory()->for($user, 'owner')->create();
        $file = DriveItem::factory()->file('gone')->for($user, 'owner')->in($folder)->create();
        $key = $file->key;
        $folder->subtree()->delete();

        $this->actingAs($user)
            ->from(route('drive.trash'))
            ->delete(route('drive.trash.empty'), ['confirmation' => 'CONFIRM'])
            ->assertRedirect(route('drive.trash'))
            ->assertSessionHasNoErrors();

        $this->assertNull(DriveItem::withTrashed()->find($folder->id));
        $this->assertNull(DriveItem::withTrashed()->find($file->id));
        Storage::disk(config('drive.disk'))->assertMissing($key);
    }

    public function test_emptying_trash_requires_the_word_confirm(): void
    {
        $user = User::factory()->create();
        $file = DriveItem::factory()->file()->for($user, 'owner')->create();
        $file->delete();

        $this->actingAs($user)
            ->from(route('drive.trash'))
            ->delete(route('drive.trash.empty'), ['confirmation' => 'confirm'])
            ->assertRedirect(route('drive.trash'))
            ->assertSessionHasErrors('confirmation');

        $this->assertSoftDeleted($file);
    }

    public function test_emptying_trash_does_not_purge_items_the_user_cannot_force_delete(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $owned = DriveItem::factory()->file('mine')->for($member, 'owner')->create();
        $foreign = DriveItem::factory()->file('theirs')->for($owner, 'owner')->create();
        $ownedKey = $owned->key;
        $foreignKey = $foreign->key;
        $owned->delete();
        $foreign->delete();

        $this->actingAs($member)
            ->from(route('drive.trash'))
            ->delete(route('drive.trash.empty'), ['confirmation' => 'CONFIRM'])
            ->assertRedirect(route('drive.trash'))
            ->assertSessionHasNoErrors();

        $this->assertNull(DriveItem::withTrashed()->find($owned->id));
        $this->assertSoftDeleted($foreign);
        Storage::disk(config('drive.disk'))->assertMissing($ownedKey);
        Storage::disk(config('drive.disk'))->assertExists($foreignKey);
    }

    public function test_super_admins_can_empty_everyones_trash(): void
    {
        $owner = User::factory()->create();
        $admin = User::factory()->superAdmin()->create();
        $file = DriveItem::factory()->file('gone')->for($owner, 'owner')->create();
        $key = $file->key;
        $file->delete();

        $this->actingAs($admin)
            ->from(route('drive.trash'))
            ->delete(route('drive.trash.empty'), ['confirmation' => 'CONFIRM'])
            ->assertRedirect(route('drive.trash'))
            ->assertSessionHasNoErrors();

        $this->assertNull(DriveItem::withTrashed()->find($file->id));
        Storage::disk(config('drive.disk'))->assertMissing($key);
    }
}
