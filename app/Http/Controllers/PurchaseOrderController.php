<?php

namespace App\Http\Controllers;

use App\Actions\PurchaseOrder\ImportPurchaseOrderAction;
use App\Actions\PurchaseOrder\ScanPurchaseOrderPdfAction;
use App\Http\Requests\ScanPurchaseOrderPdfRequest;
use App\Http\Requests\StorePurchaseOrderRequest;
use App\Models\PurchaseOrder;
use App\Services\PurchaseOrder\PurchaseOrderDisk;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PurchaseOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', PurchaseOrder::class);

        return Inertia::render('purchase-orders/index', [
            'orders' => $this->orderList(),
            'order' => null,
            'can_create' => $request->user()?->can('create', PurchaseOrder::class) ?? false,
        ]);
    }

    public function scan(ScanPurchaseOrderPdfRequest $request, ScanPurchaseOrderPdfAction $action): JsonResponse
    {
        $file = $request->file('file');
        abort_unless($file instanceof UploadedFile, 422);

        return response()->json($action->handle($file));
    }

    public function store(StorePurchaseOrderRequest $request, ImportPurchaseOrderAction $action): RedirectResponse
    {
        $file = $request->file('file');
        abort_unless($file instanceof UploadedFile, 422);

        $order = $action->handle($file, $request->purchaseOrderData());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Purchase order imported.')]);

        return to_route('purchase-orders.show', $order);
    }

    public function show(Request $request, PurchaseOrder $purchaseOrder): Response
    {
        $this->authorize('view', $purchaseOrder);

        $purchaseOrder->load(['labours']);

        return Inertia::render('purchase-orders/index', [
            'orders' => $this->orderList(),
            'order' => $purchaseOrder->toProfileArray(),
            'can_create' => $request->user()?->can('create', PurchaseOrder::class) ?? false,
        ]);
    }

    public function downloadPdf(PurchaseOrder $purchaseOrder, PurchaseOrderDisk $disk): StreamedResponse
    {
        $this->authorize('view', $purchaseOrder);
        abort_unless($purchaseOrder->hasPdf(), 404);

        return $disk->download($purchaseOrder);
    }

    public function previewPdf(PurchaseOrder $purchaseOrder, PurchaseOrderDisk $disk): StreamedResponse
    {
        $this->authorize('view', $purchaseOrder);
        abort_unless($purchaseOrder->hasPdf(), 404);

        return $disk->inline($purchaseOrder);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function orderList(): Collection
    {
        return PurchaseOrder::query()
            ->select([
                'id',
                'po_number',
                'po_date',
                'order_type',
                'ccc',
                'description',
                'po_amount',
                'source',
                'memo_number',
                'invoice_no',
                'payment_date',
            ])
            ->orderByDesc('po_date')
            ->orderByDesc('id')
            ->get()
            ->map(fn (PurchaseOrder $order): array => $order->toListArray())
            ->values();
    }
}
