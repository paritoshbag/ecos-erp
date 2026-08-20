<?php

namespace Tests\Feature\Settings;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class OrganizationChromeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_guests_do_not_receive_organization_identity(): void
    {
        $this->get(route('login'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('organization', null),
            );

        $this->assertSame(0, Organization::query()->count());
    }

    public function test_dashboard_does_not_create_an_organization_row(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('organization', null),
            );

        $this->assertSame(0, Organization::query()->count());
    }

    public function test_saved_organization_is_shared_on_the_dashboard(): void
    {
        $user = User::factory()->create();
        $organization = Organization::factory()->create([
            'company_name' => 'Maakali Construction',
            'vendor_code' => 'MKC-2041',
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('organization.company_name', 'Maakali Construction')
                ->where('organization.vendor_code', 'MKC-2041')
                ->where('organization.gst', $organization->gst)
                ->where('organization.pan', $organization->pan)
                ->missing('organization.licenceNo')
                ->missing('organization.field1'),
            );
    }

    public function test_members_see_the_saved_organization_in_shared_props(): void
    {
        $member = User::factory()->create();
        Organization::factory()->create([
            'company_name' => 'Eastland Electricals',
            'vendor_code' => 'EE-110',
        ]);

        $this->actingAs($member)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('organization.company_name', 'Eastland Electricals')
                ->where('organization.vendor_code', 'EE-110'),
            );
    }

    public function test_updating_organization_settings_refreshes_shared_identity(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->patch(route('organization.update'), [
                'company_name' => 'Riverbank Power',
                'gst' => '19AAAAA0000A1Z5',
                'pan' => 'AAAAA0000A',
                'address' => 'Burdwan, West Bengal',
                'email' => 'accounts@example.com',
                'mobile' => '9876543210',
                'vendor_code' => 'RBP-88',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('organization.edit'));

        $this->actingAs($admin)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('organization.company_name', 'Riverbank Power')
                ->where('organization.vendor_code', 'RBP-88'),
            );
    }
}
