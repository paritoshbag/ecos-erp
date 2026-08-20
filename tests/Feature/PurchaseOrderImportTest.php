<?php

namespace Tests\Feature;

use App\Enums\PurchaseOrderSource;
use App\Models\MasterLabour;
use App\Models\PurchaseOrder;
use App\Models\User;
use Database\Seeders\MasterLabourSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PurchaseOrderImportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        Storage::fake((string) config('purchase-orders.disk'));
    }

    public function test_guests_cannot_scan_or_store_purchase_orders(): void
    {
        $this->post(route('purchase-orders.scan'), [
            'file' => $this->pdf('5101100982 - PO (SYS).pdf'),
        ])->assertRedirect(route('login'));

        $this->post(route('purchase-orders.store'), $this->payload(
            $this->pdf('5101100982 - PO (SYS).pdf'),
        ))->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_scan_a_purchase_order_pdf(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('purchase-orders.scan'), [
                'file' => $this->pdf('5101100982 - PO (SYS).pdf'),
            ])
            ->assertOk()
            ->assertJsonPath('draft.po_number', '5101100982')
            ->assertJsonPath('draft.po_date', '2026-03-30')
            ->assertJsonPath('draft.order_no', '20301869')
            ->assertJsonPath('draft.reference_no', '627521')
            ->assertJsonPath('draft.order_type', 51)
            ->assertJsonPath('draft.ccc', 'KALNA')
            ->assertJsonPath('draft.po_amount', '49486.00')
            ->assertJsonPath('draft.project_id', null)
            ->assertJsonPath('draft.memo_date', null)
            ->assertJsonPath('duplicates.po_number', false)
            ->assertJsonPath('duplicates.pdf', false)
            ->assertJsonPath('duplicates.existing_po_number', null)
            ->assertJsonPath('duplicates.existing_pdf_po_number', null)
            ->assertJsonPath('lines.0.description', 'ERRECTION OF 8 M PCC SP WITHOUT FITNG')
            ->assertJsonPath('lines.0.quantity', '9.000')
            ->assertJsonPath('lines.0.unit', 'NOS')
            ->assertJsonPath('lines.0.rate', '1501.00')
            ->assertJsonPath('lines.0.amount', '13509.00')
            ->assertJsonPath('lines.0.in_master', false)
            ->assertJsonCount(14, 'lines');
    }

    public function test_scan_marks_catalogue_matches_on_labour_lines(): void
    {
        $this->seed(MasterLabourSeeder::class);

        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('purchase-orders.scan'), [
                'file' => $this->pdf('5101100982 - PO (SYS).pdf'),
            ])
            ->assertOk()
            ->assertJsonPath('lines.0.in_master', true)
            ->assertJsonPath('lines.0.master_labour_id', 5)
            ->assertJsonPath('lines.2.description', 'EARTHING COMPLETE')
            ->assertJsonPath('lines.2.in_master', true)
            ->assertJsonPath('lines.2.master_labour_id', 84)
            ->assertJsonPath('lines.5.in_master', false);
    }

    public function test_scan_flags_duplicate_po_number_and_pdf_hash(): void
    {
        $user = User::factory()->create();
        $file = $this->pdf('5101100982 - PO (SYS).pdf');
        $hash = hash_file('sha256', $file->getRealPath());

        PurchaseOrder::factory()->imported()->create([
            'po_number' => '5101100982',
            'pdf_hash' => $hash,
        ]);

        $this->actingAs($user)
            ->postJson(route('purchase-orders.scan'), ['file' => $file])
            ->assertOk()
            ->assertJsonPath('duplicates.po_number', true)
            ->assertJsonPath('duplicates.pdf', true)
            ->assertJsonPath('duplicates.existing_po_number', '5101100982')
            ->assertJsonPath('duplicates.existing_pdf_po_number', '5101100982');
    }

    public function test_scan_returns_the_existing_profile_when_only_the_po_number_matches(): void
    {
        $user = User::factory()->create();

        PurchaseOrder::factory()->create([
            'po_number' => '5101100982',
        ]);

        $this->actingAs($user)
            ->postJson(route('purchase-orders.scan'), [
                'file' => $this->pdf('5101100982 - PO (SYS).pdf'),
            ])
            ->assertOk()
            ->assertJsonPath('duplicates.po_number', true)
            ->assertJsonPath('duplicates.pdf', false)
            ->assertJsonPath('duplicates.existing_po_number', '5101100982')
            ->assertJsonPath('duplicates.existing_pdf_po_number', null);
    }

    public function test_authenticated_users_can_import_a_scanned_purchase_order(): void
    {
        $user = User::factory()->create();
        $file = $this->pdf('5301086659 - PO (SYS).pdf');

        $this->actingAs($user)
            ->post(route('purchase-orders.store'), $this->payload($file, [
                'po_number' => '5301086659',
                'po_date' => '2026-03-12',
                'order_type' => 53,
                'ccc' => 'BDP',
                'description' => 'PO FOR SYSTEM IMPROVEMENT WORK',
                'po_amount' => '27799.92',
                'memo_number' => 'DM/KLD/2025-2026/PO-CAPEX/KALNA-254',
                'project_id' => 'ALT/WS/AB/25/0383',
                'reference_no' => 'ALT/WS/AB/25/0383',
            ]))
            ->assertRedirect(route('purchase-orders.show', '5301086659'))
            ->assertSessionHasNoErrors();

        $order = PurchaseOrder::query()->where('po_number', '5301086659')->first();

        $this->assertNotNull($order);
        $this->assertSame(PurchaseOrderSource::Import, $order->source);
        $this->assertSame('BDP', $order->ccc);
        $this->assertSame('ALT/WS/AB/25/0383', $order->project_id);
        $this->assertSame('ALT/WS/AB/25/0383', $order->reference_no);
        $this->assertSame('27799.92', $order->po_amount);
        $this->assertNotNull($order->pdf_hash);
        $this->assertNotNull($order->pdf_key);
        Storage::disk((string) config('purchase-orders.disk'))->assertExists($order->pdf_key);
        $this->assertSame(16, $order->labours()->count());
        $this->assertFalse($order->hasMaterials());
        $this->assertTrue($order->labours()->where('description', 'GIS SURVEY PER POLE OR ITEM')->exists());
        $this->assertTrue(
            MasterLabour::query()
                ->where('description', 'GIS SURVEY PER POLE OR ITEM')
                ->where('unit', 'NOS')
                ->where('price', '31.00')
                ->exists(),
        );
    }

    public function test_duplicate_po_number_cannot_be_stored(): void
    {
        $user = User::factory()->create();

        PurchaseOrder::factory()->create([
            'po_number' => '5101100982',
        ]);

        $this->actingAs($user)
            ->from(route('purchase-orders.index'))
            ->post(route('purchase-orders.store'), $this->payload(
                $this->pdf('5101100982 - PO (SYS).pdf'),
            ))
            ->assertRedirect(route('purchase-orders.index'))
            ->assertSessionHasErrors('po_number');

        $this->assertSame(1, PurchaseOrder::query()->where('po_number', '5101100982')->count());
    }

    public function test_the_same_pdf_cannot_be_uploaded_twice(): void
    {
        $user = User::factory()->create();
        $first = $this->pdf('5101100982 - PO (SYS).pdf');

        $this->actingAs($user)
            ->post(route('purchase-orders.store'), $this->payload($first))
            ->assertRedirect(route('purchase-orders.show', '5101100982'))
            ->assertSessionHasNoErrors();

        $this->actingAs($user)
            ->from(route('purchase-orders.index'))
            ->post(route('purchase-orders.store'), $this->payload(
                $this->pdf('5101100982 - PO (SYS).pdf'),
                ['po_number' => '5101999999'],
            ))
            ->assertRedirect(route('purchase-orders.index'))
            ->assertSessionHasErrors('file');

        $this->assertSame(1, PurchaseOrder::query()->count());
    }

    public function test_import_matches_catalogue_rows_and_inserts_missing_master_labours(): void
    {
        $this->seed(MasterLabourSeeder::class);

        $before = MasterLabour::query()->count();
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('purchase-orders.store'), $this->payload(
                $this->pdf('5101100982 - PO (SYS).pdf'),
            ))
            ->assertRedirect(route('purchase-orders.show', '5101100982'))
            ->assertSessionHasNoErrors();

        $order = PurchaseOrder::query()->where('po_number', '5101100982')->first();

        $this->assertNotNull($order);
        $this->assertSame(14, $order->labours()->count());

        $earthing = $order->labours()->where('description', 'EARTHING COMPLETE')->first();

        $this->assertNotNull($earthing);
        $this->assertSame(84, $earthing->master_labour_id);

        $erection = $order->labours()->where('description', 'ERRECTION OF 8 M PCC SP WITHOUT FITNG')->first();

        $this->assertNotNull($erection);
        $this->assertSame(5, $erection->master_labour_id);

        $this->assertGreaterThan($before, MasterLabour::query()->count());
        $this->assertTrue(
            MasterLabour::query()
                ->where('description', 'RESAGGING/ DISMANTLING & RE-ERECTION/ DI')
                ->exists(),
        );
    }

    public function test_non_pdf_uploads_are_rejected(): void
    {
        $user = User::factory()->create();
        $upload = UploadedFile::fake()->create('notes.txt', 12, 'text/plain');

        $this->actingAs($user)
            ->postJson(route('purchase-orders.scan'), ['file' => $upload])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('file');

        $this->actingAs($user)
            ->from(route('purchase-orders.index'))
            ->post(route('purchase-orders.store'), $this->payload($upload))
            ->assertRedirect(route('purchase-orders.index'))
            ->assertSessionHasErrors('file');
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function payload(UploadedFile $file, array $overrides = []): array
    {
        return [
            'file' => $file,
            'po_number' => '5101100982',
            'po_date' => '2026-03-30',
            'order_type' => 51,
            'ccc' => 'KALNA',
            'description' => 'PO FOR Breakdown & Maintenance work',
            'po_amount' => '49486.00',
            'memo_number' => 'DM/KLD/2025-26/PO-MAINT/274',
            'memo_date' => null,
            'project_id' => null,
            'order_no' => '20301869',
            'reference_no' => '627521',
            ...$overrides,
        ];
    }

    private function pdf(string $filename): UploadedFile
    {
        $path = base_path('tests/Fixtures/purchase-orders/'.$filename);

        return new UploadedFile($path, $filename, 'application/pdf', null, true);
    }
}
