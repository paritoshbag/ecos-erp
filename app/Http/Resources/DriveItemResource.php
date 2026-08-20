<?php

namespace App\Http\Resources;

use App\Models\DriveItem;
use App\Models\DriveLink;
use App\Models\DriveShare;
use App\Models\User;
use Illuminate\Support\Number;

class DriveItemResource
{
    /**
     * @return array<string, mixed>
     */
    public static function make(DriveItem $item, User $user): array
    {
        $canUpdate = $user->can('update', $item);
        $canShare = $user->can('share', $item);

        return [
            'id' => $item->id,
            'parent_id' => $item->parent_id,
            'type' => $item->type->value,
            'name' => $item->name,
            'mime_type' => $item->mime_type,
            'size' => $item->size,
            'size_label' => $item->size !== null ? Number::fileSize($item->size) : null,
            'items_count' => $item->children_count,
            'owner' => [
                'id' => $item->owner->id,
                'name' => $item->owner->name,
            ],
            'updated_at' => $item->updated_at?->toIso8601String(),
            'updated_at_label' => $item->updated_at?->diffForHumans(),
            'deleted_at' => $item->deleted_at?->toIso8601String(),
            'deleted_at_label' => $item->deleted_at?->diffForHumans(),
            'is_shared' => ($item->shares_count ?? $item->shares->count()) > 0
                || ($item->links_count ?? $item->links->count()) > 0,
            'can_update' => $canUpdate,
            'can_share' => $canShare,
            'can_delete' => $user->can('delete', $item),
            'can_restore' => $item->trashed() && $user->can('restore', $item),
            'can_purge' => $item->trashed() && $user->can('forceDelete', $item),
            'can_preview' => $item->isPreviewable(),
            'shares' => $canShare
                ? $item->shares->map(fn (DriveShare $share): array => self::share($share))->values()->all()
                : [],
            'public_link' => $canShare ? self::publicLink($item->links->first()) : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function share(DriveShare $share): array
    {
        return [
            'id' => $share->id,
            'permission' => $share->permission->value,
            'user' => [
                'id' => $share->user->id,
                'name' => $share->user->name,
                'email' => $share->user->email,
            ],
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    public static function publicLink(?DriveLink $link): ?array
    {
        if ($link === null || $link->isExpired()) {
            return null;
        }

        return [
            'id' => $link->id,
            'token' => $link->token,
            'url' => route('drive.public.show', $link->token),
            'expires_at' => $link->expires_at?->toIso8601String(),
        ];
    }

    /**
     * @return array{id: int, name: string, type: string}|null
     */
    public static function folderSummary(?DriveItem $folder): ?array
    {
        if ($folder === null) {
            return null;
        }

        return [
            'id' => $folder->id,
            'name' => $folder->name,
            'type' => $folder->type->value,
        ];
    }

    /**
     * @return list<array{title: string, href: string}>
     */
    public static function breadcrumbs(?DriveItem $folder): array
    {
        $crumbs = [
            [
                'title' => 'Drive',
                'href' => route('drive.index'),
            ],
        ];

        if ($folder === null) {
            return $crumbs;
        }

        foreach ($folder->breadcrumbTrail() as $crumb) {
            $crumbs[] = [
                'title' => $crumb->name,
                'href' => route('drive.folders.show', $crumb),
            ];
        }

        return $crumbs;
    }
}
