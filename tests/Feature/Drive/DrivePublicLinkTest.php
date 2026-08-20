<?php

namespace Tests\Feature\Drive;

use App\Models\DriveItem;
use App\Models\DriveLink;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

class DrivePublicLinkTest extends DriveTestCase
{
    public function test_owners_can_create_a_public_link(): void
    {
        $user = User::factory()->create();
        $file = DriveItem::factory()->file()->for($user, 'owner')->create();

        $this->actingAs($user)
            ->post(route('drive.links.store', $file))
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertTrue($file->links()->exists());
    }

    public function test_guests_can_view_a_public_link(): void
    {
        $user = User::factory()->create();
        $file = DriveItem::factory()->file('secret')->for($user, 'owner')->create(['name' => 'public.txt']);
        $link = DriveLink::factory()->for($file, 'item')->for($user, 'creator')->create();

        $this->get(route('drive.public.show', $link->token))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('drive/public')
                ->where('current.name', 'public.txt')
            );
    }

    public function test_guests_can_download_a_public_file(): void
    {
        $user = User::factory()->create();
        $file = DriveItem::factory()->file('secret')->for($user, 'owner')->create(['name' => 'public.txt']);
        $link = DriveLink::factory()->for($file, 'item')->for($user, 'creator')->create();

        $this->get(route('drive.public.download', $link->token))
            ->assertOk()
            ->assertDownload('public.txt');
    }

    public function test_expired_public_links_are_not_found(): void
    {
        $user = User::factory()->create();
        $file = DriveItem::factory()->file()->for($user, 'owner')->create();
        $link = DriveLink::factory()->for($file, 'item')->for($user, 'creator')->expired()->create();

        $this->get(route('drive.public.show', $link->token))->assertNotFound();
    }

    public function test_unknown_tokens_are_not_found(): void
    {
        $this->get(route('drive.public.show', str_repeat('a', 64)))->assertNotFound();
    }

    public function test_guests_can_browse_children_of_a_shared_folder(): void
    {
        $user = User::factory()->create();
        $folder = DriveItem::factory()->for($user, 'owner')->create(['name' => 'Shared']);
        $file = DriveItem::factory()->file()->for($user, 'owner')->in($folder)->create(['name' => 'inside.txt']);
        $link = DriveLink::factory()->for($folder, 'item')->for($user, 'creator')->create();

        $this->get(route('drive.public.show', ['token' => $link->token, 'item' => $file->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('current.name', 'inside.txt')
            );
    }

    public function test_owners_can_revoke_a_public_link(): void
    {
        $user = User::factory()->create();
        $file = DriveItem::factory()->file()->for($user, 'owner')->create();
        $link = DriveLink::factory()->for($file, 'item')->for($user, 'creator')->create();

        $this->actingAs($user)
            ->delete(route('drive.links.destroy', $link))
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertModelMissing($link);
    }
}
