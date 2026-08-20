<?php

namespace App\Actions\Drive;

use App\Models\DriveItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MoveDriveItemAction
{
    public function handle(DriveItem $item, ?DriveItem $destination): DriveItem
    {
        if ($item->wouldCycleIfMovedTo($destination)) {
            throw ValidationException::withMessages([
                'parent_id' => 'You cannot move an item into itself or one of its folders.',
            ]);
        }

        return DB::transaction(function () use ($item, $destination): DriveItem {
            $oldPath = $item->path;
            $item->parent_id = $destination?->id;
            $item->save();
            $item->refreshPath();
            $item->relocateSubtree($oldPath);

            return $item->refresh();
        });
    }
}
