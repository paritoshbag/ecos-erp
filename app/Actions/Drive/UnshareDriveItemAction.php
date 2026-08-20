<?php

namespace App\Actions\Drive;

use App\Models\DriveShare;

class UnshareDriveItemAction
{
    public function handle(DriveShare $share): void
    {
        $share->delete();
    }
}
