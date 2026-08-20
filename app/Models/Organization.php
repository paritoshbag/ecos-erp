<?php

namespace App\Models;

use Database\Factories\OrganizationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $singleton
 * @property string|null $company_name
 * @property string|null $gst
 * @property string|null $pan
 * @property string|null $address
 * @property string|null $email
 * @property string|null $website
 * @property string|null $mobile
 * @property string|null $secondary_mobile
 * @property string|null $company_type
 * @property string|null $vendor_code
 * @property string|null $field1
 * @property string|null $field2
 * @property string|null $field3
 * @property string|null $field4
 * @property string|null $field5
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'company_name',
    'gst',
    'pan',
    'address',
    'email',
    'website',
    'mobile',
    'secondary_mobile',
    'company_type',
    'vendor_code',
    'field1',
    'field2',
    'field3',
    'field4',
    'field5',
])]
class Organization extends Model
{
    /** @use HasFactory<OrganizationFactory> */
    use HasFactory;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'singleton' => 1,
    ];

    /**
     * Get the single organization row for this tenant, creating it if needed.
     */
    public static function current(): self
    {
        return static::query()->firstOrCreate([
            'singleton' => 1,
        ]);
    }

    /**
     * Get the organization row when it already exists, without creating one.
     */
    public static function existing(): ?self
    {
        return static::query()->where('singleton', 1)->first();
    }

    /**
     * Identity shown in the application chrome.
     *
     * @return array{
     *     company_name: string|null,
     *     vendor_code: string|null,
     *     gst: string|null,
     *     pan: string|null,
     *     company_type: string|null,
     *     address: string|null,
     *     email: string|null,
     *     mobile: string|null
     * }
     */
    public function toChromeIdentity(): array
    {
        return [
            'company_name' => $this->company_name,
            'vendor_code' => $this->vendor_code,
            'gst' => $this->gst,
            'pan' => $this->pan,
            'company_type' => $this->company_type,
            'address' => $this->address,
            'email' => $this->email,
            'mobile' => $this->mobile,
        ];
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'singleton' => 'integer',
        ];
    }
}
