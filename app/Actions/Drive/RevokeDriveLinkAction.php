<?php

namespace App\Actions\Drive;

use App\Models\DriveLink;

class RevokeDriveLinkAction
{
    public function handle(DriveLink $link): void
    {
        $link->delete();
    }
}
