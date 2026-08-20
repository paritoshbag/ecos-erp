<?php

namespace Tests\Feature\Drive;

use App\Models\DriveItem;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class DriveUploadTest extends DriveTestCase
{
    public function test_users_can_upload_a_file_to_the_root(): void
    {
        $user = User::factory()->create();
        $upload = UploadedFile::fake()->create('brief.pdf', 120, 'application/pdf');

        $this->actingAs($user)
            ->post(route('drive.files.store'), ['file' => $upload])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $file = DriveItem::query()->where('name', 'brief.pdf')->first();

        $this->assertNotNull($file);
        $this->assertTrue($file->isFile());
        $this->assertSame($user->id, $file->user_id);
        Storage::disk(config('drive.disk'))->assertExists($file->key);
    }

    public function test_users_can_download_files(): void
    {
        $user = User::factory()->create();
        $file = DriveItem::factory()->file('hello world')->for($user, 'owner')->create(['name' => 'notes.txt']);

        $this->actingAs($user)
            ->get(route('drive.items.download', $file))
            ->assertOk()
            ->assertDownload('notes.txt');
    }

    public function test_users_can_preview_images(): void
    {
        $user = User::factory()->create();
        $file = DriveItem::factory()->image()->for($user, 'owner')->create();

        $this->actingAs($user)
            ->get(route('drive.items.preview', $file))
            ->assertOk()
            ->assertHeader('content-type', 'image/png');
    }

    public function test_non_previewable_files_cannot_be_previewed(): void
    {
        $user = User::factory()->create();
        $file = DriveItem::factory()->file()->for($user, 'owner')->create();

        $this->actingAs($user)
            ->get(route('drive.items.preview', $file))
            ->assertNotFound();
    }
}
