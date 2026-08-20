<?php

namespace Tests\Feature\Settings;

use App\Models\Letterhead;
use App\Models\Organization;
use App\Models\User;
use App\Services\Letterhead\LetterheadService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LetterheadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        Storage::fake((string) config('letterheads.disk'));
    }

    public function test_guests_are_redirected_from_letterhead_settings(): void
    {
        $this->get(route('letterhead.edit'))->assertRedirect(route('login'));
    }

    public function test_members_cannot_view_or_change_letterheads(): void
    {
        $member = User::factory()->create();
        $letterhead = Letterhead::factory()->create();

        $this->actingAs($member)
            ->get(route('letterhead.edit'))
            ->assertForbidden();

        $this->actingAs($member)
            ->post(route('letterhead.from-preset'), ['preset' => 'classic'])
            ->assertForbidden();

        $this->actingAs($member)
            ->patchJson(route('letterhead.update', $letterhead), ['name' => 'Nope'])
            ->assertForbidden();
    }

    public function test_super_admin_can_view_letterhead_settings(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->get(route('letterhead.edit'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('settings/letterhead')
                ->has('presets', 4)
                ->has('tokens')
                ->has('tokenValues')
                ->where('letterheads', []),
            );
    }

    public function test_super_admin_can_activate_a_preset(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->post(route('letterhead.from-preset'), ['preset' => 'classic'])
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $letterhead = Letterhead::query()->first();

        $this->assertNotNull($letterhead);
        $this->assertTrue($letterhead->is_active);
        $this->assertFalse($letterhead->is_custom);
        $this->assertSame('classic', $letterhead->source_preset);
        $this->assertSame('Classic', $letterhead->name);
    }

    public function test_activating_a_preset_twice_reuses_the_same_row(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->post(route('letterhead.from-preset'), ['preset' => 'classic']);

        $this->actingAs($admin)
            ->post(route('letterhead.from-preset'), ['preset' => 'classic']);

        $this->assertSame(1, Letterhead::query()->count());
    }

    public function test_super_admin_can_customize_a_preset_into_an_editable_copy(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->post(route('letterhead.from-preset'), [
                'preset' => 'banner',
                'duplicate' => true,
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $this->assertSame(2, Letterhead::query()->count());

        $copy = Letterhead::query()->where('is_custom', true)->first();

        $this->assertNotNull($copy);
        $this->assertFalse($copy->is_active);
        $this->assertSame('Copy of Banner', $copy->name);
    }

    public function test_custom_letterhead_can_be_auto_saved(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $letterhead = Letterhead::factory()->custom()->create();

        $this->actingAs($admin)
            ->patchJson(route('letterhead.update', $letterhead), [
                'name' => 'Site letterhead',
                'paper_size' => 'letter',
                'header' => [
                    'layout' => 'centered',
                    'lines' => ['{{company_name}}', 'GST {{gst}}'],
                ],
                'footer' => [
                    'lines' => ['{{email}}'],
                ],
            ])
            ->assertOk()
            ->assertJsonPath('letterhead.name', 'Site letterhead')
            ->assertJsonPath('letterhead.paper_size', 'letter')
            ->assertJsonPath('letterhead.header.layout', 'centered');

        $letterhead->refresh();

        $this->assertSame('Site letterhead', $letterhead->name);
        $this->assertSame(['{{company_name}}', 'GST {{gst}}'], $letterhead->header['lines']);
    }

    public function test_locked_presets_cannot_be_edited(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $letterhead = Letterhead::factory()->create();

        $this->actingAs($admin)
            ->patchJson(route('letterhead.update', $letterhead), [
                'name' => 'Changed',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');

        $this->assertSame('Classic', $letterhead->fresh()->name);
    }

    public function test_super_admin_can_upload_a_scanned_letterhead_and_save_the_writable_area(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $upload = UploadedFile::fake()->image('stationery.png', 800, 1100);

        $this->actingAs($admin)
            ->post(route('letterhead.scans.store'), [
                'file' => $upload,
                'paper_size' => 'a4',
                'name' => 'Office pad',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $letterhead = Letterhead::query()->first();

        $this->assertNotNull($letterhead);
        $this->assertTrue($letterhead->isScanned());
        $this->assertTrue($letterhead->is_custom);
        $this->assertFalse($letterhead->is_active);
        Storage::disk((string) config('letterheads.disk'))->assertExists($letterhead->background_key);

        $this->actingAs($admin)
            ->patchJson(route('letterhead.update', $letterhead), [
                'writable_top' => 20,
                'writable_left' => 10,
                'writable_width' => 80,
                'writable_height' => 60,
            ])
            ->assertOk()
            ->assertJsonPath('letterhead.writable_top', 20);

        $this->actingAs($admin)
            ->get(route('letterhead.background', $letterhead))
            ->assertOk();
    }

    public function test_pdf_uploads_are_rejected_on_the_server(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $upload = UploadedFile::fake()->create('pad.pdf', 120, 'application/pdf');

        $this->actingAs($admin)
            ->from(route('letterhead.edit'))
            ->post(route('letterhead.scans.store'), ['file' => $upload])
            ->assertSessionHasErrors('file')
            ->assertRedirect(route('letterhead.edit'));
    }

    public function test_high_precision_writable_coordinates_are_saved(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $letterhead = Letterhead::factory()->scanned()->create();

        $this->actingAs($admin)
            ->patchJson(route('letterhead.update', $letterhead), [
                'writable_top' => 33.333333333,
                'writable_left' => 8.111111,
                'writable_width' => 84.0,
                'writable_height' => 66.666666667,
            ])
            ->assertOk()
            ->assertJsonPath('letterhead.writable_top', 33.33)
            ->assertJsonPath('letterhead.writable_height', 66.67);

        $letterhead->refresh();

        $this->assertEqualsWithDelta(33.33, $letterhead->writable_top, 0.001);
        $this->assertEqualsWithDelta(66.67, $letterhead->writable_height, 0.001);
    }

    public function test_super_admin_can_activate_and_cannot_delete_the_active_letterhead(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $first = Letterhead::factory()->custom()->active()->create();
        $second = Letterhead::factory()->custom()->create(['name' => 'Second']);

        $this->actingAs($admin)
            ->post(route('letterhead.activate', $second))
            ->assertRedirect();

        $this->assertFalse($first->fresh()->is_active);
        $this->assertTrue($second->fresh()->is_active);

        $this->actingAs($admin)
            ->from(route('letterhead.edit'))
            ->delete(route('letterhead.destroy', $second))
            ->assertSessionHasErrors('letterhead');

        $this->assertNotNull($second->fresh());

        $this->actingAs($admin)
            ->delete(route('letterhead.destroy', $first))
            ->assertRedirect();

        $this->assertNull($first->fresh());
    }

    public function test_custom_designed_letterhead_can_receive_a_logo(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $letterhead = Letterhead::factory()->custom()->create();
        $logo = UploadedFile::fake()->image('logo.png', 120, 80);

        $this->actingAs($admin)
            ->post(route('letterhead.logo.store', $letterhead), ['logo' => $logo])
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $letterhead->refresh();

        $this->assertTrue($letterhead->hasLogo());
        Storage::disk((string) config('letterheads.disk'))->assertExists($letterhead->logo_key);

        $this->actingAs($admin)
            ->get(route('letterhead.logo.show', $letterhead))
            ->assertOk();
    }

    public function test_unknown_presets_are_rejected(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->from(route('letterhead.edit'))
            ->post(route('letterhead.from-preset'), ['preset' => 'not-a-preset'])
            ->assertSessionHasErrors('preset');
    }

    public function test_token_substitution_uses_organization_values(): void
    {
        $organization = Organization::current();
        $organization->fill(Organization::factory()->raw())->save();

        $text = app(LetterheadService::class)->substitute(
            '{{company_name}} / GST {{gst}}',
            $organization->fresh(),
        );

        $this->assertSame('Maakali Construction / GST 19AAAAA0000A1Z5', $text);
    }
}
