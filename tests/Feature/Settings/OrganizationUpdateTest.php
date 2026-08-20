<?php

namespace Tests\Feature\Settings;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class OrganizationUpdateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    /**
     * @param  array<string, string>  $overrides
     * @return array<string, string>
     */
    private function validPayload(array $overrides = []): array
    {
        return [
            'company_name' => 'Maakali Construction',
            'gst' => '19AAAAA0000A1Z5',
            'pan' => 'AAAAA0000A',
            'address' => 'Burdwan, West Bengal',
            'email' => 'accounts@example.com',
            'website' => 'https://example.com',
            'mobile' => '9876543210',
            'secondary_mobile' => '9123456789',
            'company_type' => 'Private Limited',
            'vendor_code' => 'VEND001',
            'field1' => 'Custom one',
            'field2' => 'Custom two',
            'field3' => 'Custom three',
            'field4' => 'Custom four',
            'field5' => 'Custom five',
            ...$overrides,
        ];
    }

    public function test_guests_are_redirected_from_organization_settings(): void
    {
        $this->get(route('organization.edit'))->assertRedirect(route('login'));

        $this->patch(route('organization.update'), $this->validPayload())
            ->assertRedirect(route('login'));
    }

    public function test_members_cannot_view_or_update_organization_settings(): void
    {
        $member = User::factory()->create();

        $this->actingAs($member)
            ->get(route('organization.edit'))
            ->assertForbidden();

        $this->actingAs($member)
            ->patch(route('organization.update'), $this->validPayload())
            ->assertForbidden();

        $this->assertSame(0, Organization::query()->count());
    }

    public function test_super_admin_can_view_organization_settings(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->get(route('organization.edit'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('settings/organization')
                ->has('organization.id')
                ->where('organization.singleton', 1),
            );

        $this->assertSame(1, Organization::query()->count());
    }

    public function test_super_admin_can_update_organization_settings(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->patch(route('organization.update'), $this->validPayload([
                'gst' => '19aaaaa0000a1z5',
                'pan' => 'aaaaa0000a',
            ]))
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('organization.edit'));

        $organization = Organization::current();

        $this->assertSame('Maakali Construction', $organization->company_name);
        $this->assertSame('19AAAAA0000A1Z5', $organization->gst);
        $this->assertSame('AAAAA0000A', $organization->pan);
        $this->assertSame('Burdwan, West Bengal', $organization->address);
        $this->assertSame('accounts@example.com', $organization->email);
        $this->assertSame('https://example.com', $organization->website);
        $this->assertSame('9876543210', $organization->mobile);
        $this->assertSame('9123456789', $organization->secondary_mobile);
        $this->assertSame('Private Limited', $organization->company_type);
        $this->assertSame('VEND001', $organization->vendor_code);
        $this->assertSame('Custom one', $organization->field1);
        $this->assertSame('Custom two', $organization->field2);
        $this->assertSame('Custom three', $organization->field3);
        $this->assertSame('Custom four', $organization->field4);
        $this->assertSame('Custom five', $organization->field5);
    }

    public function test_partial_update_does_not_clear_omitted_fields(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->patch(route('organization.update'), $this->validPayload())
            ->assertSessionHasNoErrors();

        $this->actingAs($admin)
            ->patch(route('organization.update'), [
                'company_name' => 'Updated Construction',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('organization.edit'));

        $organization = Organization::current();

        $this->assertSame('Updated Construction', $organization->company_name);
        $this->assertSame('19AAAAA0000A1Z5', $organization->gst);
        $this->assertSame('AAAAA0000A', $organization->pan);
        $this->assertSame('Burdwan, West Bengal', $organization->address);
        $this->assertSame('accounts@example.com', $organization->email);
        $this->assertSame('https://example.com', $organization->website);
        $this->assertSame('9876543210', $organization->mobile);
        $this->assertSame('9123456789', $organization->secondary_mobile);
        $this->assertSame('Private Limited', $organization->company_type);
        $this->assertSame('VEND001', $organization->vendor_code);
        $this->assertSame('Custom one', $organization->field1);
        $this->assertSame('Custom two', $organization->field2);
        $this->assertSame('Custom three', $organization->field3);
        $this->assertSame('Custom four', $organization->field4);
        $this->assertSame('Custom five', $organization->field5);
    }

    public function test_optional_fields_may_be_omitted(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $payload = $this->validPayload();
        unset($payload['website'], $payload['secondary_mobile'], $payload['company_type'], $payload['field1'], $payload['field2'], $payload['field3'], $payload['field4'], $payload['field5']);

        $this->actingAs($admin)
            ->patch(route('organization.update'), $payload)
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('organization.edit'));

        $organization = Organization::current();

        $this->assertSame('Maakali Construction', $organization->company_name);
        $this->assertNull($organization->website);
        $this->assertNull($organization->secondary_mobile);
        $this->assertNull($organization->company_type);
        $this->assertNull($organization->field1);
        $this->assertNull($organization->field2);
        $this->assertNull($organization->field3);
        $this->assertNull($organization->field4);
        $this->assertNull($organization->field5);
    }

    public function test_required_fields_cannot_be_blank(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->from(route('organization.edit'))
            ->patch(route('organization.update'), [
                'company_name' => '',
                'gst' => '',
                'pan' => '',
                'address' => '',
                'email' => '',
                'mobile' => '',
                'vendor_code' => '',
            ])
            ->assertSessionHasErrors([
                'company_name',
                'gst',
                'pan',
                'address',
                'email',
                'mobile',
                'vendor_code',
            ])
            ->assertRedirect(route('organization.edit'));
    }

    public function test_invalid_gst_pan_email_and_mobile_are_rejected(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->from(route('organization.edit'))
            ->patch(route('organization.update'), $this->validPayload([
                'gst' => 'NOTAVALIDGSTIN',
                'pan' => 'ABCDEFGHIJ',
                'email' => 'not-an-email',
                'mobile' => '12345',
            ]))
            ->assertSessionHasErrors(['gst', 'pan', 'email', 'mobile'])
            ->assertRedirect(route('organization.edit'));
    }

    public function test_invalid_secondary_mobile_is_rejected(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->from(route('organization.edit'))
            ->patch(route('organization.update'), $this->validPayload([
                'secondary_mobile' => '12345',
            ]))
            ->assertSessionHasErrors(['secondary_mobile'])
            ->assertRedirect(route('organization.edit'));
    }

    public function test_gst_and_pan_must_be_exact_length(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->from(route('organization.edit'))
            ->patch(route('organization.update'), $this->validPayload([
                'gst' => '19AAAAA0000A1Z',
                'pan' => 'AAAAA0000',
            ]))
            ->assertSessionHasErrors(['gst', 'pan'])
            ->assertRedirect(route('organization.edit'));
    }

    public function test_gst_and_pan_punctuation_is_stripped(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->patch(route('organization.update'), $this->validPayload([
                'gst' => '19-AAAAA-0000-A1Z5',
                'pan' => 'AAAAA 0000 A',
            ]))
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('organization.edit'));

        $organization = Organization::current();

        $this->assertSame('19AAAAA0000A1Z5', $organization->gst);
        $this->assertSame('AAAAA0000A', $organization->pan);
    }
}
