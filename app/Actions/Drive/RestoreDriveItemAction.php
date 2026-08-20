<?php

namespace App\Actions\Drive;

use App\Models\DriveItem;
use Illuminate\Support\Facades\DB;

class RestoreDriveItemAction
{
    public function handle(DriveItem $item): DriveItem
    {
        return DB::transaction(function () use ($item): DriveItem {
            $item->trashedSubtree()->restore();

            $item->refresh();

            $parent = $item->parent_id !== null
                ? DriveItem::withTrashed()->find($item->parent_id)
                : null;

            if ($parent?->trashed()) {
                $oldPath = $item->path;
                $item->parent_id = null;
                $item->save();
                $item->refreshPath();
                $item->relocateSubtree($oldPath);
            }

            return $item->refresh();
        });
    }
}
