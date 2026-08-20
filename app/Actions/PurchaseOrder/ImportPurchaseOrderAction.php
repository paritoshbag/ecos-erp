<?php

namespace App\Actions\PurchaseOrder;

use App\Enums\PurchaseOrderSource;
use App\Models\PurchaseOrder;
use App\Services\PurchaseOrder\MasterLabourMatcher;
use App\Services\PurchaseOrder\PurchaseOrderDisk;
use App\Services\PurchaseOrder\PurchaseOrderPdfParser;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ImportPurchaseOrderAction
{
    public function __construct(
        private PurchaseOrderDisk $disk,
        private PurchaseOrderPdfParser $parser,
        private MasterLabourMatcher $matcher,
    ) {}

    /**
     * @param  array{
     *     po_number: string,
     *     po_date: string,
     *     order_type: int,
     *     ccc: string,
     *     description: string,
     *     po_amount: string,
     *     memo_number?: string|null,
     *     memo_date?: string|null,
     *     project_id?: string|null,
     *     order_no?: string|null,
     *     reference_no?: string|null
     * }  $attributes
     */
    public function handle(UploadedFile $file, array $attributes): PurchaseOrder
    {
        $parsed = $this->parser->parse($file);
        $hash = $parsed['pdf_hash'];

        return Cache::lock('purchase-order-pdf:'.$hash, 10)->block(5, function () use ($file, $attributes, $parsed, $hash): PurchaseOrder {
            if (PurchaseOrder::query()->where('pdf_hash', $hash)->exists()) {
                throw ValidationException::withMessages([
                    'file' => __('This PDF was already imported.'),
                ]);
            }

            if (PurchaseOrder::query()->where('po_number', $attributes['po_number'])->exists()) {
                throw ValidationException::withMessages([
                    'po_number' => __('A purchase order with this number already exists.'),
                ]);
            }

            $stored = $this->disk->store($file);

            return DB::transaction(function () use ($file, $attributes, $parsed, $stored, $hash): PurchaseOrder {
                $order = PurchaseOrder::query()->create([
                    'po_number' => $attributes['po_number'],
                    'po_date' => $attributes['po_date'],
                    'order_type' => $attributes['order_type'],
                    'ccc' => $attributes['ccc'],
                    'description' => $attributes['description'],
                    'po_amount' => $attributes['po_amount'],
                    'source' => PurchaseOrderSource::Import,
                    'memo_number' => $attributes['memo_number'] ?? null,
                    'memo_date' => $attributes['memo_date'] ?? null,
                    'project_id' => $attributes['project_id'] ?? null,
                    'order_no' => $attributes['order_no'] ?? null,
                    'reference_no' => $attributes['reference_no'] ?? null,
                    'pdf_disk' => $stored['disk'],
                    'pdf_key' => $stored['key'],
                    'pdf_original_name' => $file->getClientOriginalName(),
                    'pdf_hash' => $hash,
                ]);

                $this->matcher->persist($order, $parsed['lines']);

                return $order;
            });
        });
    }
}
