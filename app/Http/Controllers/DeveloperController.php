<?php

namespace App\Http\Controllers;

use App\Actions\Developer\DeletePurchaseOrdersAction;
use App\Actions\Developer\SeedPurchaseOrdersAction;
use App\Models\PurchaseOrder;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DeveloperController extends Controller
{
    public function index(): Response
    {
        $this->authorize('accessDeveloperTools');

        return Inertia::render('developer/index', [
            'purchase_order_count' => PurchaseOrder::query()->count(),
        ]);
    }

    public function seedPurchaseOrders(SeedPurchaseOrdersAction $action): RedirectResponse
    {
        $this->authorize('accessDeveloperTools');

        $action->handle();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Purchase orders seeded.')]);

        return to_route('developer.index');
    }

    public function destroyPurchaseOrders(DeletePurchaseOrdersAction $action): RedirectResponse
    {
        $this->authorize('accessDeveloperTools');

        $action->handle();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('All purchase orders deleted.')]);

        return to_route('developer.index');
    }
}
