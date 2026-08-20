<?php

namespace App\Actions\Drive;

use App\Models\DriveItem;
use App\Models\User;

class EmptyDriveTrashAction
{
    public function __construct(private PurgeDriveItemAction $purge) {}

    public function handle(User $user): void
    {
        $items = DriveItem::onlyTrashed()
            ->orderBy('path')
            ->get()
            ->filter(fn (DriveItem $item): bool => $user->can('forceDelete', $item));

        foreach ($items as $item) {
            $this->purge->handle($item);
        }
    }
}
