<?php

namespace App\Actions\Drive;

use App\Enums\DrivePermission;
use App\Models\DriveItem;
use App\Models\DriveShare;
use App\Models\User;

class ShareDriveItemAction
{
    public function handle(DriveItem $item, User $grantee): DriveShare
    {
        return DriveShare::query()->updateOrCreate(
            [
                'drive_item_id' => $item->id,
                'user_id' => $grantee->id,
            ],
            [
                'permission' => DrivePermission::Editor,
            ],
        );
    }
}
