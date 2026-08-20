<?php

namespace Tests\Feature;

use App\Enums\PurchaseOrderSource;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderLabour;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PurchaseOrderShowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        Storage::fake((string) config('purchase-orders.disk'));
    }

    public function test_guests_are_redirected_from_the_purchase_order_profile(): void
    {
        $order = PurchaseOrder::factory()->create([
            'po_number' => '5300999999',
        ]);

        $this->get(route('purchase-orders.show', $order))->assertRedirect(route('login'));
        $this->get(route('purchase-orders.pdf', $order))->assertRedirect(route('login'));
        $this->get(route('purchase-orders.pdf.preview', $order))->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_view_the_purchase_order_profile(): void
    {
        $user = User::factory()->create();

        $order = PurchaseOrder::factory()->create([
            'po_number' => '5300999999',
            'po_date' => '2024-01-15',
            'ccc' => 'BDP',
            'order_type' => 10,
            'description' => 'CABLE WORK AT BAIDYAPUR CCC',
            'po_amount' => '125000.50',
            'source' => PurchaseOrderSource::Manual,
            'memo_number' => 'MEMO-1',
            'project_id' => 'ALT/WS/AB/25/0383',
            'invoice_no' => 'INV-88',
            'payment_date' => null,
        ]);

        $this->actingAs($user)
            ->get(route('purchase-orders.show', $order))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('purchase-orders/index')
                ->where('order.po_number', '5300999999')
                ->where('order.ccc', 'BDP')
                ->where('order.po_amount', '125000.50')
                ->where('order.status', 'invoiced')
                ->where('order.source', 'manual')
                ->where('order.has_pdf', false)
                ->where('order.has_materials', false)
                ->where('order.memo_number', 'MEMO-1')
                ->where('order.project_id', 'ALT/WS/AB/25/0383')
                ->has('order.labours', 0)
                ->has('orders', 1)
                ->where('orders.0.po_number', '5300999999')
                ->missing('order.pdf_hash')
                ->missing('order.pdf_key')
                ->missing('order.pdf_disk')
            );
    }

    public function test_the_profile_includes_stored_labour_rows(): void
    {
        $user = User::factory()->create();
        $order = PurchaseOrder::factory()->create();

        PurchaseOrderLabour::factory()->create([
            'purchase_order_id' => $order->id,
            'line_no' => 1,
            'description' => 'EARTHING COMPLETE',
            'quantity' => '9.000',
            'unit' => 'NOS',
            'rate' => '313.00',
            'amount' => '2817.00',
        ]);

        $this->actingAs($user)
            ->get(route('purchase-orders.show', $order))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('order.labours', 1)
                ->where('order.labours.0.description', 'EARTHING COMPLETE')
                ->where('order.labours.0.quantity', '9.000')
                ->where('order.labours.0.unit', 'NOS')
                ->where('order.labours.0.rate', '313.00')
                ->where('order.labours.0.amount', '2817.00')
            );
    }

    public function test_paid_orders_are_marked_paid_on_the_profile(): void
    {
        $user = User::factory()->create();

        $order = PurchaseOrder::factory()->create([
            'invoice_no' => 'INV-1',
            'payment_date' => '2024-03-01',
        ]);

        $this->actingAs($user)
            ->get(route('purchase-orders.show', $order))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('order.status', 'paid')
            );
    }

    public function test_unknown_purchase_orders_return_not_found(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('purchase-orders.show', '9999999999'))
            ->assertNotFound();
    }

    public function test_pdf_routes_return_not_found_when_no_file_is_stored(): void
    {
        $user = User::factory()->create();
        $order = PurchaseOrder::factory()->create();

        $this->actingAs($user)
            ->get(route('purchase-orders.pdf', $order))
            ->assertNotFound();

        $this->actingAs($user)
            ->get(route('purchase-orders.pdf.preview', $order))
            ->assertNotFound();
    }

    public function test_users_can_download_and_preview_the_stored_pdf(): void
    {
        $user = User::factory()->create();
        $order = $this->orderWithPdf();

        $this->actingAs($user)
            ->get(route('purchase-orders.show', $order))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('order.has_pdf', true)
                ->where('order.has_materials', false)
                ->where('order.pdf_original_name', '5101100982 - PO (SYS).pdf')
            );

        $this->actingAs($user)
            ->get(route('purchase-orders.pdf', $order))
            ->assertOk()
            ->assertDownload('5101100982 - PO (SYS).pdf');

        $this->actingAs($user)
            ->get(route('purchase-orders.pdf.preview', $order))
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }

    private function orderWithPdf(): PurchaseOrder
    {
        $order = PurchaseOrder::factory()->imported()->create([
            'po_number' => '5101100982',
            'pdf_key' => 'uuid/po.pdf',
            'pdf_original_name' => '5101100982 - PO (SYS).pdf',
            'pdf_disk' => (string) config('purchase-orders.disk'),
        ]);

        Storage::disk((string) config('purchase-orders.disk'))->put(
            (string) $order->pdf_key,
            '%PDF-1.4 fake',
        );

        return $order;
    }
}
