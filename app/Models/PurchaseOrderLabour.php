<?php

namespace App\Models;

use Database\Factories\PurchaseOrderLabourFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $purchase_order_id
 * @property int $master_labour_id
 * @property int $line_no
 * @property string $description
 * @property string|null $hsn_sac
 * @property string $quantity
 * @property string $unit
 * @property string $rate
 * @property string $freight_and_insurance
 * @property string $amount
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read PurchaseOrder $purchaseOrder
 * @property-read MasterLabour $masterLabour
 */
#[Fillable([
    'purchase_order_id',
    'master_labour_id',
    'line_no',
    'description',
    'hsn_sac',
    'quantity',
    'unit',
    'rate',
    'freight_and_insurance',
    'amount',
])]
class PurchaseOrderLabour extends Model
{
    /** @use HasFactory<PurchaseOrderLabourFactory> */
    use HasFactory;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'freight_and_insurance' => '0',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'line_no' => 'integer',
            'quantity' => 'decimal:3',
            'rate' => 'decimal:2',
            'freight_and_insurance' => 'decimal:2',
            'amount' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<PurchaseOrder, $this>
     */
    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    /**
     * @return BelongsTo<MasterLabour, $this>
     */
    public function masterLabour(): BelongsTo
    {
        return $this->belongsTo(MasterLabour::class);
    }

    /**
     * @return array{
     *     id: int,
     *     line_no: int,
     *     description: string,
     *     hsn_sac: string|null,
     *     quantity: string,
     *     unit: string,
     *     rate: string,
     *     freight_and_insurance: string,
     *     amount: string,
     *     master_labour_id: int
     * }
     */
    public function toListArray(): array
    {
        return [
            'id' => $this->id,
            'line_no' => $this->line_no,
            'description' => $this->description,
            'hsn_sac' => $this->hsn_sac,
            'quantity' => $this->quantity,
            'unit' => $this->unit,
            'rate' => $this->rate,
            'freight_and_insurance' => $this->freight_and_insurance,
            'amount' => $this->amount,
            'master_labour_id' => $this->master_labour_id,
        ];
    }
}
