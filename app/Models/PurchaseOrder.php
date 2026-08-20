<?php

namespace App\Models;

use App\Enums\PurchaseOrderSource;
use Carbon\CarbonInterface;
use Database\Factories\PurchaseOrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $po_number
 * @property Carbon $po_date
 * @property int $order_type
 * @property string $ccc
 * @property string $description
 * @property string $po_amount
 * @property PurchaseOrderSource $source
 * @property string|null $memo_number
 * @property Carbon|null $memo_date
 * @property string|null $project_id
 * @property string|null $order_no
 * @property string|null $reference_no
 * @property string|null $subject
 * @property string|null $service_acceptance_no
 * @property Carbon|null $service_acceptance_date
 * @property string|null $service_acceptance_amount
 * @property string|null $service_account_no
 * @property string|null $accepted_amount
 * @property string|null $requisition_copy_no
 * @property string|null $sirn_number
 * @property string|null $completion_letter
 * @property string|null $measurement_done
 * @property string|null $mb_no
 * @property bool $mb_written
 * @property Carbon|null $commenced_on
 * @property Carbon|null $completed_on
 * @property Carbon|null $measured_on
 * @property string|null $zmm_confirmation_no
 * @property string|null $ccc_issue_no
 * @property Carbon|null $ccc_issue_date
 * @property Carbon|null $ccc_receive_date
 * @property string|null $bill_issue_no
 * @property Carbon|null $bill_issue_date
 * @property string|null $bill_receive_no
 * @property Carbon|null $bill_receive_date
 * @property bool $bill_signed
 * @property string|null $invoice_no
 * @property Carbon|null $invoice_date
 * @property string|null $gross_bill_amount
 * @property string|null $cgst
 * @property string|null $sgst
 * @property string|null $total_gross_amount
 * @property string|null $security_deposit
 * @property string|null $income_tax
 * @property string|null $cess
 * @property string|null $wct
 * @property string|null $material_deduction
 * @property string|null $penalty
 * @property string|null $tax_deduction
 * @property string|null $net_amount_gst
 * @property string|null $net_amount
 * @property string|null $final_receipt_issue_no
 * @property Carbon|null $final_receipt_issue_date
 * @property Carbon|null $deposit_date
 * @property Carbon|null $payment_date
 * @property string|null $payment_year
 * @property Carbon|null $security_claimed_on
 * @property Carbon|null $security_paid_on
 * @property string|null $srn_number
 * @property string|null $pdf_disk
 * @property string|null $pdf_key
 * @property string|null $pdf_original_name
 * @property string|null $pdf_hash
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read EloquentCollection<int, PurchaseOrderLabour> $labours
 */
#[Fillable([
    'po_number',
    'po_date',
    'order_type',
    'ccc',
    'description',
    'po_amount',
    'source',
    'memo_number',
    'memo_date',
    'project_id',
    'order_no',
    'reference_no',
    'subject',
    'service_acceptance_no',
    'service_acceptance_date',
    'service_acceptance_amount',
    'service_account_no',
    'accepted_amount',
    'requisition_copy_no',
    'sirn_number',
    'completion_letter',
    'measurement_done',
    'mb_no',
    'mb_written',
    'commenced_on',
    'completed_on',
    'measured_on',
    'zmm_confirmation_no',
    'ccc_issue_no',
    'ccc_issue_date',
    'ccc_receive_date',
    'bill_issue_no',
    'bill_issue_date',
    'bill_receive_no',
    'bill_receive_date',
    'bill_signed',
    'invoice_no',
    'invoice_date',
    'gross_bill_amount',
    'cgst',
    'sgst',
    'total_gross_amount',
    'security_deposit',
    'income_tax',
    'cess',
    'wct',
    'material_deduction',
    'penalty',
    'tax_deduction',
    'net_amount_gst',
    'net_amount',
    'final_receipt_issue_no',
    'final_receipt_issue_date',
    'deposit_date',
    'payment_date',
    'payment_year',
    'security_claimed_on',
    'security_paid_on',
    'srn_number',
    'pdf_disk',
    'pdf_key',
    'pdf_original_name',
    'pdf_hash',
])]
class PurchaseOrder extends Model
{
    /** @use HasFactory<PurchaseOrderFactory> */
    use HasFactory;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'po_amount' => '0',
        'source' => 'manual',
        'mb_written' => false,
        'bill_signed' => false,
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'po_date' => 'date',
            'order_type' => 'integer',
            'po_amount' => 'decimal:2',
            'source' => PurchaseOrderSource::class,
            'memo_date' => 'date',
            'service_acceptance_date' => 'date',
            'service_acceptance_amount' => 'decimal:2',
            'accepted_amount' => 'decimal:2',
            'mb_written' => 'boolean',
            'commenced_on' => 'date',
            'completed_on' => 'date',
            'measured_on' => 'date',
            'ccc_issue_date' => 'date',
            'ccc_receive_date' => 'date',
            'bill_issue_date' => 'date',
            'bill_receive_date' => 'date',
            'bill_signed' => 'boolean',
            'invoice_date' => 'date',
            'gross_bill_amount' => 'decimal:2',
            'cgst' => 'decimal:2',
            'sgst' => 'decimal:2',
            'total_gross_amount' => 'decimal:2',
            'security_deposit' => 'decimal:2',
            'income_tax' => 'decimal:2',
            'cess' => 'decimal:2',
            'wct' => 'decimal:2',
            'material_deduction' => 'decimal:2',
            'penalty' => 'decimal:2',
            'tax_deduction' => 'decimal:2',
            'net_amount_gst' => 'decimal:2',
            'net_amount' => 'decimal:2',
            'final_receipt_issue_date' => 'date',
            'deposit_date' => 'date',
            'payment_date' => 'date',
            'security_claimed_on' => 'date',
            'security_paid_on' => 'date',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'po_number';
    }

    /**
     * @return 'open'|'invoiced'|'paid'
     */
    public function status(): string
    {
        if ($this->payment_date !== null) {
            return 'paid';
        }

        if ($this->invoice_no !== null) {
            return 'invoiced';
        }

        return 'open';
    }

    public function hasPdf(): bool
    {
        return filled($this->pdf_key);
    }

    /**
     * PDF import stores labour lines only. Materials are a separate list
     * and are not uploaded with the first PDF.
     */
    public function hasMaterials(): bool
    {
        return false;
    }

    /**
     * @return HasMany<PurchaseOrderLabour, $this>
     */
    public function labours(): HasMany
    {
        return $this->hasMany(PurchaseOrderLabour::class)->orderBy('line_no');
    }

    /**
     * @return array{
     *     id: int,
     *     po_number: string,
     *     po_date: string,
     *     order_type: int,
     *     ccc: string,
     *     description: string,
     *     po_amount: string,
     *     source: string,
     *     memo_number: string|null,
     *     status: string,
     *     has_materials: bool
     * }
     */
    public function toListArray(): array
    {
        return [
            'id' => $this->id,
            'po_number' => $this->po_number,
            'po_date' => $this->po_date->toDateString(),
            'order_type' => $this->order_type,
            'ccc' => $this->ccc,
            'description' => $this->description,
            'po_amount' => $this->po_amount,
            'source' => $this->source->value,
            'memo_number' => $this->memo_number,
            'status' => $this->status(),
            'has_materials' => $this->hasMaterials(),
        ];
    }

    /**
     * @return array{
     *     id: int,
     *     po_number: string,
     *     po_date: string,
     *     order_type: int,
     *     ccc: string,
     *     description: string,
     *     po_amount: string,
     *     source: string,
     *     status: string,
     *     has_pdf: bool,
     *     has_materials: bool,
     *     pdf_original_name: string|null,
     *     memo_number: string|null,
     *     memo_date: string|null,
     *     project_id: string|null,
     *     order_no: string|null,
     *     reference_no: string|null,
     *     subject: string|null,
     *     service_acceptance_no: string|null,
     *     service_acceptance_date: string|null,
     *     service_acceptance_amount: string|null,
     *     service_account_no: string|null,
     *     accepted_amount: string|null,
     *     requisition_copy_no: string|null,
     *     sirn_number: string|null,
     *     completion_letter: string|null,
     *     measurement_done: string|null,
     *     mb_no: string|null,
     *     mb_written: bool,
     *     commenced_on: string|null,
     *     completed_on: string|null,
     *     measured_on: string|null,
     *     zmm_confirmation_no: string|null,
     *     ccc_issue_no: string|null,
     *     ccc_issue_date: string|null,
     *     ccc_receive_date: string|null,
     *     bill_issue_no: string|null,
     *     bill_issue_date: string|null,
     *     bill_receive_no: string|null,
     *     bill_receive_date: string|null,
     *     bill_signed: bool,
     *     invoice_no: string|null,
     *     invoice_date: string|null,
     *     gross_bill_amount: string|null,
     *     cgst: string|null,
     *     sgst: string|null,
     *     total_gross_amount: string|null,
     *     security_deposit: string|null,
     *     income_tax: string|null,
     *     cess: string|null,
     *     wct: string|null,
     *     material_deduction: string|null,
     *     penalty: string|null,
     *     tax_deduction: string|null,
     *     net_amount_gst: string|null,
     *     net_amount: string|null,
     *     final_receipt_issue_no: string|null,
     *     final_receipt_issue_date: string|null,
     *     deposit_date: string|null,
     *     payment_date: string|null,
     *     payment_year: string|null,
     *     security_claimed_on: string|null,
     *     security_paid_on: string|null,
     *     srn_number: string|null,
     *     labours: list<array{
     *         id: int,
     *         line_no: int,
     *         description: string,
     *         hsn_sac: string|null,
     *         quantity: string,
     *         unit: string,
     *         rate: string,
     *         freight_and_insurance: string,
     *         amount: string,
     *         master_labour_id: int
     *     }>
     * }
     */
    public function toProfileArray(): array
    {
        return [
            'id' => $this->id,
            'po_number' => $this->po_number,
            'po_date' => $this->po_date->toDateString(),
            'order_type' => $this->order_type,
            'ccc' => $this->ccc,
            'description' => $this->description,
            'po_amount' => $this->po_amount,
            'source' => $this->source->value,
            'status' => $this->status(),
            'has_pdf' => $this->hasPdf(),
            'has_materials' => $this->hasMaterials(),
            'pdf_original_name' => $this->pdf_original_name,
            'memo_number' => $this->memo_number,
            'memo_date' => $this->dateString($this->memo_date),
            'project_id' => $this->project_id,
            'order_no' => $this->order_no,
            'reference_no' => $this->reference_no,
            'subject' => $this->subject,
            'service_acceptance_no' => $this->service_acceptance_no,
            'service_acceptance_date' => $this->dateString($this->service_acceptance_date),
            'service_acceptance_amount' => $this->service_acceptance_amount,
            'service_account_no' => $this->service_account_no,
            'accepted_amount' => $this->accepted_amount,
            'requisition_copy_no' => $this->requisition_copy_no,
            'sirn_number' => $this->sirn_number,
            'completion_letter' => $this->completion_letter,
            'measurement_done' => $this->measurement_done,
            'mb_no' => $this->mb_no,
            'mb_written' => $this->mb_written,
            'commenced_on' => $this->dateString($this->commenced_on),
            'completed_on' => $this->dateString($this->completed_on),
            'measured_on' => $this->dateString($this->measured_on),
            'zmm_confirmation_no' => $this->zmm_confirmation_no,
            'ccc_issue_no' => $this->ccc_issue_no,
            'ccc_issue_date' => $this->dateString($this->ccc_issue_date),
            'ccc_receive_date' => $this->dateString($this->ccc_receive_date),
            'bill_issue_no' => $this->bill_issue_no,
            'bill_issue_date' => $this->dateString($this->bill_issue_date),
            'bill_receive_no' => $this->bill_receive_no,
            'bill_receive_date' => $this->dateString($this->bill_receive_date),
            'bill_signed' => $this->bill_signed,
            'invoice_no' => $this->invoice_no,
            'invoice_date' => $this->dateString($this->invoice_date),
            'gross_bill_amount' => $this->gross_bill_amount,
            'cgst' => $this->cgst,
            'sgst' => $this->sgst,
            'total_gross_amount' => $this->total_gross_amount,
            'security_deposit' => $this->security_deposit,
            'income_tax' => $this->income_tax,
            'cess' => $this->cess,
            'wct' => $this->wct,
            'material_deduction' => $this->material_deduction,
            'penalty' => $this->penalty,
            'tax_deduction' => $this->tax_deduction,
            'net_amount_gst' => $this->net_amount_gst,
            'net_amount' => $this->net_amount,
            'final_receipt_issue_no' => $this->final_receipt_issue_no,
            'final_receipt_issue_date' => $this->dateString($this->final_receipt_issue_date),
            'deposit_date' => $this->dateString($this->deposit_date),
            'payment_date' => $this->dateString($this->payment_date),
            'payment_year' => $this->payment_year,
            'security_claimed_on' => $this->dateString($this->security_claimed_on),
            'security_paid_on' => $this->dateString($this->security_paid_on),
            'srn_number' => $this->srn_number,
            'labours' => $this->labours
                ->map(fn (PurchaseOrderLabour $labour): array => $labour->toListArray())
                ->values()
                ->all(),
        ];
    }

    private function dateString(?CarbonInterface $date): ?string
    {
        return $date?->toDateString();
    }
}
