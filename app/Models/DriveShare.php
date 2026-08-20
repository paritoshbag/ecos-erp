<?php

namespace App\Models;

use App\Enums\DrivePermission;
use Database\Factories\DriveShareFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $drive_item_id
 * @property int $user_id
 * @property DrivePermission $permission
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read DriveItem $item
 * @property-read User $user
 */
#[Fillable(['drive_item_id', 'user_id', 'permission'])]
class DriveShare extends Model
{
    /** @use HasFactory<DriveShareFactory> */
    use HasFactory;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'permission' => 'editor',
    ];

    /**
     * @return array<string, mixed>
     */
    protected function casts(): array
    {
        return [
            'permission' => DrivePermission::class,
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
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return list<int>
     */
    public static function editorItemIdsFor(User $user): array
    {
        /** @var list<int> $ids */
        $ids = once(fn (): array => static::query()
            ->where('user_id', $user->id)
            ->where('permission', DrivePermission::Editor)
            ->pluck('drive_item_id')
            ->map(fn (mixed $id): int => (int) $id)
            ->all());

        return $ids;
    }
}
