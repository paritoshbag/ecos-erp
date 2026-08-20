<?php

namespace Tests\Feature\Drive;

use App\Models\DriveItem;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

class DriveBrowseTest extends DriveTestCase
{
    public function test_guests_are_redirected_from_the_drive(): void
    {
        $this->get(route('drive.index'))->assertRedirect(route('login'));
    }

    public function test_members_can_browse_the_company_drive(): void
    {
        $user = User::factory()->create();
        $owner = User::factory()->create();
        DriveItem::factory()->for($owner, 'owner')->create(['name' => 'Contracts']);

        $this->actingAs($user)
            ->get(route('drive.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('drive/index')
                ->has('items', 1)
                ->where('items.0.name', 'Contracts')
                ->where('items.0.can_delete', false)
                ->where('can_create', true)
            );
    }

    public function test_owners_can_delete_their_own_items(): void
    {
        $user = User::factory()->create();
        DriveItem::factory()->for($user, 'owner')->create(['name' => 'Mine']);

        $this->actingAs($user)
            ->get(route('drive.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('items.0.can_delete', true)
            );
    }

    public function test_members_can_open_another_users_folder(): void
    {
        $user = User::factory()->create();
        $owner = User::factory()->create();
        $folder = DriveItem::factory()->for($owner, 'owner')->create(['name' => 'HR']);
        DriveItem::factory()->file()->for($owner, 'owner')->in($folder)->create(['name' => 'handbook.pdf']);

        $this->actingAs($user)
            ->get(route('drive.folders.show', $folder))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('drive/index')
                ->has('items', 1)
                ->where('items.0.name', 'handbook.pdf')
            );
    }

    public function test_users_can_search_across_the_drive(): void
    {
        $user = User::factory()->create();
        DriveItem::factory()->for($user, 'owner')->create(['name' => 'Invoices']);
        DriveItem::factory()->file()->for($user, 'owner')->create(['name' => 'budget.xlsx']);

        $this->actingAs($user)
            ->get(route('drive.index', ['q' => 'budget']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('query', 'budget')
                ->has('items', 1)
                ->where('items.0.name', 'budget.xlsx')
            );
    }
}
