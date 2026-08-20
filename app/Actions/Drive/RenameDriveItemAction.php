<?php

namespace App\Actions\Drive;

use App\Models\DriveItem;

class RenameDriveItemAction
{
    public function handle(DriveItem $item, string $name): DriveItem
    {
        $item->update(['name' => $name]);

        return $item;
    }
}
