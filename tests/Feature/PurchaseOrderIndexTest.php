<?php

namespace Tests\Feature;

use App\Enums\PurchaseOrderSource;
use App\Models\PurchaseOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PurchaseOrderIndexTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_guests_are_redirected_from_purchase_orders(): void
    {
        $this->get(route('purchase-orders.index'))->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_view_the_purchase_order_list(): void
    {
        $user = User::factory()->create();

        PurchaseOrder::factory()->create([
            'po_number' => '5300999999',
            'po_date' => '2024-01-15',
            'ccc' => 'BDP',
            'order_type' => 10,
            'po_amount' => '125000.50',
            'source' => PurchaseOrderSource::Manual,
        ]);

        PurchaseOrder::factory()->imported()->create([
            'po_number' => '5300888888',
            'po_date' => '2024-06-20',
            'ccc' => 'KALNA',
            'invoice_no' => 'INV-1',
            'payment_date' => '2024-03-01',
        ]);

        $this->actingAs($user)
            ->get(route('purchase-orders.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('purchase-orders/index')
                ->has('orders', 2)
                ->where('orders.0.po_number', '5300888888')
                ->where('orders.0.status', 'paid')
                ->where('orders.0.source', 'import')
                ->where('orders.0.has_materials', false)
                ->where('orders.1.po_number', '5300999999')
                ->where('orders.1.ccc', 'BDP')
                ->where('orders.1.status', 'open')
                ->where('orders.1.source', 'manual')
                ->where('can_create', true)
                ->where('order', null)
                ->missing('orders.0.gross_bill_amount')
            );
    }

    public function test_invoiced_orders_are_marked_when_unpaid(): void
    {
        $user = User::factory()->create();

        PurchaseOrder::factory()->create([
            'invoice_no' => 'INV-88',
            'payment_date' => null,
        ]);

        $this->actingAs($user)
            ->get(route('purchase-orders.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('orders.0.status', 'invoiced')
            );
    }
}
