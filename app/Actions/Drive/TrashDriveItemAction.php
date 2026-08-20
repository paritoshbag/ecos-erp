<?php

namespace App\Actions\Drive;

use App\Models\DriveItem;

class TrashDriveItemAction
{
    public function handle(DriveItem $item): void
    {
        $item->subtree()->delete();
    }
}
