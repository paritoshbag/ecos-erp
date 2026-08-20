<?php

namespace Tests\Feature;

use App\Models\PurchaseOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DeveloperPageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_guests_are_redirected_from_developer_tools(): void
    {
        $this->get(route('developer.index'))->assertRedirect(route('login'));

        $this->post(route('developer.purchase-orders.seed'))
            ->assertRedirect(route('login'));

        $this->delete(route('developer.purchase-orders.destroy'))
            ->assertRedirect(route('login'));
    }

    public function test_members_cannot_use_developer_tools(): void
    {
        $member = User::factory()->create();

        PurchaseOrder::factory()->create();

        $this->actingAs($member)
            ->get(route('developer.index'))
            ->assertForbidden();

        $this->actingAs($member)
            ->post(route('developer.purchase-orders.seed'))
            ->assertForbidden();

        $this->actingAs($member)
            ->delete(route('developer.purchase-orders.destroy'))
            ->assertForbidden();

        $this->assertSame(1, PurchaseOrder::query()->count());
    }

    public function test_super_admin_can_view_the_developer_page(): void
    {
        $admin = User::factory()->superAdmin()->create();

        PurchaseOrder::factory()->count(2)->create();

        $this->actingAs($admin)
            ->get(route('developer.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('developer/index')
                ->where('purchase_order_count', 2)
            );
    }

    public function test_super_admin_can_delete_all_purchase_orders(): void
    {
        $admin = User::factory()->superAdmin()->create();

        PurchaseOrder::factory()->count(3)->create();

        $this->actingAs($admin)
            ->delete(route('developer.purchase-orders.destroy'))
            ->assertRedirect(route('developer.index'));

        $this->assertSame(0, PurchaseOrder::query()->count());
    }

    public function test_super_admin_can_seed_purchase_orders(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->post(route('developer.purchase-orders.seed'))
            ->assertRedirect(route('developer.index'));

        $this->assertSame(2809, PurchaseOrder::query()->count());

        $order = PurchaseOrder::query()->find(1);

        $this->assertNotNull($order);
        $this->assertSame('5300174459', $order->po_number);
    }
}
