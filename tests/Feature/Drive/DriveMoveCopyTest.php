<?php

namespace Tests\Feature\Drive;

use App\Models\DriveItem;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class DriveMoveCopyTest extends DriveTestCase
{
    public function test_users_can_move_an_item_into_another_folder(): void
    {
        $user = User::factory()->create();
        $source = DriveItem::factory()->for($user, 'owner')->create(['name' => 'Source']);
        $destination = DriveItem::factory()->for($user, 'owner')->create(['name' => 'Destination']);
        $file = DriveItem::factory()->file()->for($user, 'owner')->in($source)->create(['name' => 'move-me.txt']);

        $this->actingAs($user)
            ->post(route('drive.items.move', $file), ['parent_id' => $destination->id])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $file->refresh();

        $this->assertSame($destination->id, $file->parent_id);
        $this->assertSame($destination->path.$file->id.'/', $file->path);
    }

    public function test_folders_cannot_be_moved_into_themselves(): void
    {
        $user = User::factory()->create();
        $folder = DriveItem::factory()->for($user, 'owner')->create();
        $child = DriveItem::factory()->for($user, 'owner')->in($folder)->create();

        $this->actingAs($user)
            ->from(route('drive.index'))
            ->post(route('drive.items.move', $folder), ['parent_id' => $child->id])
            ->assertRedirect(route('drive.index'))
            ->assertSessionHasErrors('parent_id');
    }

    public function test_users_can_copy_a_file(): void
    {
        $user = User::factory()->create();
        $file = DriveItem::factory()->file('copied')->for($user, 'owner')->create(['name' => 'original.txt']);

        $this->actingAs($user)
            ->post(route('drive.items.copy', $file), ['parent_id' => null])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $copy = DriveItem::query()->where('name', 'original copy.txt')->first();

        $this->assertNotNull($copy);
        $this->assertNotSame($file->id, $copy->id);
        $this->assertNotSame($file->key, $copy->key);
        Storage::disk(config('drive.disk'))->assertExists($copy->key);
    }

    public function test_copying_a_folder_copies_its_children(): void
    {
        $user = User::factory()->create();
        $folder = DriveItem::factory()->for($user, 'owner')->create(['name' => 'Pack']);
        DriveItem::factory()->file()->for($user, 'owner')->in($folder)->create(['name' => 'inside.txt']);

        $this->actingAs($user)
            ->post(route('drive.items.copy', $folder))
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $copy = DriveItem::query()->where('name', 'Pack copy')->first();

        $this->assertNotNull($copy);
        $this->assertTrue($copy->children()->where('name', 'inside.txt')->exists());
    }
}
