<?php

namespace Tests\Feature;

use App\Enums\PurchaseOrderSource;
use App\Models\PurchaseOrder;
use Database\Seeders\PurchaseOrderSeeder;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PurchaseOrderSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_seeds_the_legacy_purchase_orders(): void
    {
        $this->seed(PurchaseOrderSeeder::class);

        $this->assertSame(2809, PurchaseOrder::query()->count());

        $order = PurchaseOrder::query()->find(1);

        $this->assertNotNull($order);
        $this->assertSame('5300174459', $order->po_number);
        $this->assertSame('BDP', $order->ccc);
        $this->assertSame(10, $order->order_type);
        $this->assertSame('166221.00', $order->po_amount);
        $this->assertSame(PurchaseOrderSource::Import, $order->source);
        $this->assertSame('YES', $order->measurement_done);
        $this->assertTrue($order->bill_signed);
        $this->assertFalse($order->mb_written);
        $this->assertNull($order->ccc_receive_date);
        $this->assertNull($order->invoice_date);
        $this->assertNull($order->payment_date);
        $this->assertNull($order->bill_issue_no);
    }

    public function test_purchase_order_seeder_is_idempotent(): void
    {
        $this->seed(PurchaseOrderSeeder::class);
        $this->seed(PurchaseOrderSeeder::class);

        $this->assertSame(2809, PurchaseOrder::query()->count());
    }

    public function test_factory_can_create_additional_purchase_orders(): void
    {
        $this->seed(PurchaseOrderSeeder::class);

        $order = PurchaseOrder::factory()->create();
        $imported = PurchaseOrder::factory()->imported()->create();

        $this->assertModelExists($order);
        $this->assertModelExists($imported);
        $this->assertSame(PurchaseOrderSource::Manual, $order->source);
        $this->assertSame(PurchaseOrderSource::Import, $imported->source);
        $this->assertSame(2811, PurchaseOrder::query()->count());
    }

    public function test_po_number_is_unique(): void
    {
        $order = PurchaseOrder::factory()->create();

        $this->expectException(UniqueConstraintViolationException::class);

        PurchaseOrder::factory()->create([
            'po_number' => $order->po_number,
        ]);
    }
}
