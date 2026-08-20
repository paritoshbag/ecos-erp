<?php

namespace App\Models;

use App\Enums\DriveItemType;
use Database\Factories\DriveItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int|null $parent_id
 * @property DriveItemType $type
 * @property string $name
 * @property int $user_id
 * @property string $path
 * @property string|null $disk
 * @property string|null $key
 * @property string|null $mime_type
 * @property int|null $size
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property-read User $owner
 * @property-read self|null $parent
 * @property-read EloquentCollection<int, self> $children
 * @property-read EloquentCollection<int, DriveShare> $shares
 * @property-read EloquentCollection<int, DriveLink> $links
 * @property-read int|null $children_count
 * @property-read int|null $shares_count
 * @property-read int|null $links_count
 */
#[Fillable(['parent_id', 'type', 'name', 'user_id', 'path', 'disk', 'key', 'mime_type', 'size'])]
class DriveItem extends Model
{
    /** @use HasFactory<DriveItemFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @return array<string, mixed>
     */
    protected function casts(): array
    {
        return [
            'type' => DriveItemType::class,
            'size' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::created(function (DriveItem $item): void {
            if ($item->path === '/' || $item->path === '') {
                $item->refreshPath();
            }
        });
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return BelongsTo<self, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /**
     * @return HasMany<self, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('name');
    }

    /**
     * @return HasMany<DriveShare, $this>
     */
    public function shares(): HasMany
    {
        return $this->hasMany(DriveShare::class);
    }

    /**
     * @return HasMany<DriveLink, $this>
     */
    public function links(): HasMany
    {
        return $this->hasMany(DriveLink::class);
    }

    public function isFolder(): bool
    {
        return $this->type === DriveItemType::Folder;
    }

    public function isFile(): bool
    {
        return $this->type === DriveItemType::File;
    }

    public function isPreviewable(): bool
    {
        if (! $this->isFile() || $this->mime_type === null) {
            return false;
        }

        /** @var list<string> $mimes */
        $mimes = config('drive.preview_mimes');

        return in_array($this->mime_type, $mimes, true);
    }

    /**
     * @return list<int>
     */
    public function ancestorIds(): array
    {
        $segments = array_values(array_filter(
            explode('/', trim($this->path, '/')),
            fn (string $segment): bool => $segment !== '',
        ));

        return array_map(fn (string $segment): int => (int) $segment, $segments);
    }

    public function buildPath(): string
    {
        if ($this->parent_id === null) {
            return '/'.$this->id.'/';
        }

        $parentPath = static::withTrashed()->whereKey($this->parent_id)->value('path') ?? '/';

        return $parentPath.$this->id.'/';
    }

    public function refreshPath(): void
    {
        $this->forceFill(['path' => $this->buildPath()])->saveQuietly();
    }

    public function relocateSubtree(string $oldPath): void
    {
        $newPath = $this->path;

        if ($oldPath === $newPath) {
            return;
        }

        static::withTrashed()
            ->where('path', 'like', $oldPath.'%')
            ->where('id', '!=', $this->id)
            ->orderBy('path')
            ->each(function (DriveItem $descendant) use ($oldPath, $newPath): void {
                $descendant->forceFill([
                    'path' => $newPath.Str::after($descendant->path, $oldPath),
                ])->saveQuietly();
            });
    }

    public function isAncestorOf(self $item): bool
    {
        return str_starts_with($item->path, $this->path);
    }

    public function wouldCycleIfMovedTo(?self $destination): bool
    {
        if ($destination === null) {
            return false;
        }

        if ($destination->is($this)) {
            return true;
        }

        return $this->isFolder() && $this->isAncestorOf($destination);
    }

    /**
     * @return Builder<static>
     */
    public function subtree(): Builder
    {
        return static::query()->where('path', 'like', $this->path.'%');
    }

    /**
     * @return Builder<DriveItem>
     */
    public function trashedSubtree(): Builder
    {
        return DriveItem::onlyTrashed()->where('path', 'like', $this->path.'%');
    }

    /**
     * @return EloquentCollection<int, static>
     */
    public function breadcrumbTrail(): EloquentCollection
    {
        $ids = $this->ancestorIds();

        $items = static::query()->whereIn('id', $ids)->get()->keyBy('id');

        return new EloquentCollection(
            collect($ids)
                ->map(fn (int $id): ?static => $items->get($id))
                ->filter()
                ->values()
                ->all(),
        );
    }

    public function locationLabel(): string
    {
        return $this->breadcrumbTrail()->pluck('name')->implode(' / ');
    }

    public function editableBy(User $user): bool
    {
        if ($user->isSuperAdmin() || $this->user_id === $user->id) {
            return true;
        }

        $sharedIds = DriveShare::editorItemIdsFor($user);

        return count(array_intersect($sharedIds, $this->ancestorIds())) > 0;
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    #[Scope]
    protected function folders(Builder $query): Builder
    {
        return $query->where('type', DriveItemType::Folder);
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    #[Scope]
    protected function files(Builder $query): Builder
    {
        return $query->where('type', DriveItemType::File);
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    #[Scope]
    protected function atRoot(Builder $query): Builder
    {
        return $query->whereNull('parent_id');
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    #[Scope]
    protected function inFolder(Builder $query, ?int $parentId): Builder
    {
        if ($parentId === null) {
            return $query->whereNull('parent_id');
        }

        return $query->where('parent_id', $parentId);
    }
}
