<?php

namespace App\Models;

use Database\Factories\DriveLinkFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $drive_item_id
 * @property string $token
 * @property Carbon|null $expires_at
 * @property int $created_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read DriveItem $item
 * @property-read User $creator
 */
#[Fillable(['drive_item_id', 'token', 'expires_at', 'created_by'])]
class DriveLink extends Model
{
    /** @use HasFactory<DriveLinkFactory> */
    use HasFactory;

    /**
     * @return array<string, mixed>
     */
    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<DriveItem, $this>
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(DriveItem::class, 'drive_item_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function isAccessible(): bool
    {
        return ! $this->item->trashed() && ! $this->isExpired();
    }
}
