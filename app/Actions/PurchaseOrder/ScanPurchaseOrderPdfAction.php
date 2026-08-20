<?php

namespace App\Actions\PurchaseOrder;

use App\Models\PurchaseOrder;
use App\Services\PurchaseOrder\MasterLabourMatcher;
use App\Services\PurchaseOrder\PurchaseOrderPdfParser;
use Illuminate\Http\UploadedFile;

class ScanPurchaseOrderPdfAction
{
    public function __construct(
        private PurchaseOrderPdfParser $parser,
        private MasterLabourMatcher $matcher,
    ) {}

    /**
     * @return array{
     *     draft: array{
     *         memo_number: string|null,
     *         memo_date: string|null,
     *         po_number: string|null,
     *         po_date: string|null,
     *         project_id: string|null,
     *         order_no: string|null,
     *         reference_no: string|null,
     *         order_type: int|null,
     *         ccc: string|null,
     *         description: string|null,
     *         po_amount: string|null
     *     },
     *     lines: list<array{
     *         line_no: int,
     *         description: string,
     *         hsn_sac: string|null,
     *         quantity: string,
     *         unit: string,
     *         rate: string,
     *         freight_and_insurance: string,
     *         amount: string,
     *         master_labour_id: int|null,
     *         master_description: string|null,
     *         in_master: bool
     *     }>,
     *     duplicates: array{
     *         po_number: bool,
     *         pdf: bool,
     *         existing_po_number: string|null,
     *         existing_pdf_po_number: string|null
     *     }
     * }
     */
    public function handle(UploadedFile $file): array
    {
        $parsed = $this->parser->parse($file);

        $poNumber = $parsed['po_number'];

        $existingByNumber = $poNumber !== null
            ? PurchaseOrder::query()->where('po_number', $poNumber)->first()
            : null;

        $existingByPdf = PurchaseOrder::query()->where('pdf_hash', $parsed['pdf_hash'])->first();

        return [
            'draft' => [
                'memo_number' => $parsed['memo_number'],
                'memo_date' => $parsed['memo_date'],
                'po_number' => $poNumber,
                'po_date' => $parsed['po_date'],
                'project_id' => $parsed['project_id'],
                'order_no' => $parsed['order_no'],
                'reference_no' => $parsed['reference_no'],
                'order_type' => $parsed['order_type'],
                'ccc' => $parsed['ccc'],
                'description' => $parsed['description'],
                'po_amount' => $parsed['po_amount'],
            ],
            'lines' => $this->matcher->preview($parsed['lines']),
            'duplicates' => [
                'po_number' => $existingByNumber !== null,
                'pdf' => $existingByPdf !== null,
                'existing_po_number' => $existingByNumber?->po_number,
                'existing_pdf_po_number' => $existingByPdf?->po_number,
            ],
        ];
    }
}
