<?php

namespace App\Models;

use App\Enums\LetterheadLayout;
use App\Enums\LetterheadType;
use App\Enums\PaperSize;
use Database\Factories\LetterheadFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property LetterheadType $type
 * @property string $name
 * @property string|null $source_preset
 * @property PaperSize $paper_size
 * @property bool $is_active
 * @property bool $is_custom
 * @property string|null $logo_disk
 * @property string|null $logo_key
 * @property string|null $logo_mime
 * @property array{layout: string, lines: list<string>}|null $header
 * @property array{lines: list<string>}|null $footer
 * @property string|null $background_disk
 * @property string|null $background_key
 * @property string|null $background_mime
 * @property float $writable_top
 * @property float $writable_left
 * @property float $writable_width
 * @property float $writable_height
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'type',
    'name',
    'source_preset',
    'paper_size',
    'is_active',
    'is_custom',
    'logo_disk',
    'logo_key',
    'logo_mime',
    'header',
    'footer',
    'background_disk',
    'background_key',
    'background_mime',
    'writable_top',
    'writable_left',
    'writable_width',
    'writable_height',
])]
class Letterhead extends Model
{
    /** @use HasFactory<LetterheadFactory> */
    use HasFactory;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'type' => 'designed',
        'paper_size' => 'a4',
        'is_active' => false,
        'is_custom' => false,
        'writable_top' => 18,
        'writable_left' => 8,
        'writable_width' => 84,
        'writable_height' => 65,
    ];

    /**
     * Get the currently active letterhead, if any.
     */
    public static function current(): ?self
    {
        return static::query()->active()->first();
    }

    /**
     * @return array<string, mixed>
     */
    protected function casts(): array
    {
        return [
            'type' => LetterheadType::class,
            'paper_size' => PaperSize::class,
            'is_active' => 'boolean',
            'is_custom' => 'boolean',
            'header' => 'array',
            'footer' => 'array',
            'writable_top' => 'float',
            'writable_left' => 'float',
            'writable_width' => 'float',
            'writable_height' => 'float',
        ];
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    #[Scope]
    protected function active(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function isDesigned(): bool
    {
        return $this->type === LetterheadType::Designed;
    }

    public function isScanned(): bool
    {
        return $this->type === LetterheadType::Scanned;
    }

    public function hasLogo(): bool
    {
        return filled($this->logo_key);
    }

    public function hasBackground(): bool
    {
        return filled($this->background_key);
    }

    public function layout(): LetterheadLayout
    {
        $layout = $this->header['layout'] ?? LetterheadLayout::Classic->value;

        return LetterheadLayout::tryFrom((string) $layout) ?? LetterheadLayout::Classic;
    }

    /**
     * Payload for the settings page. Storage keys stay off the wire.
     *
     * @return array<string, mixed>
     */
    public function toSettingsArray(): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type->value,
            'name' => $this->name,
            'source_preset' => $this->source_preset,
            'paper_size' => $this->paper_size->value,
            'is_active' => $this->is_active,
            'is_custom' => $this->is_custom,
            'header' => $this->header ?? ['layout' => LetterheadLayout::Classic->value, 'lines' => []],
            'footer' => $this->footer ?? ['lines' => []],
            'writable_top' => $this->writable_top,
            'writable_left' => $this->writable_left,
            'writable_width' => $this->writable_width,
            'writable_height' => $this->writable_height,
            'has_logo' => $this->hasLogo(),
            'has_background' => $this->hasBackground(),
            'updated_at' => $this->updated_at?->timestamp,
        ];
    }
}
