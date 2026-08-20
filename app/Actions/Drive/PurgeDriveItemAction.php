<?php

namespace App\Actions\Drive;

use App\Models\DriveItem;
use App\Services\Drive\DriveDisk;
use Illuminate\Support\Facades\DB;

class PurgeDriveItemAction
{
    public function __construct(private DriveDisk $disk) {}

    public function handle(DriveItem $item): void
    {
        DB::transaction(function () use ($item): void {
            $items = DriveItem::withTrashed()
                ->where('path', 'like', $item->path.'%')
                ->orderByDesc('path')
                ->get();

            foreach ($items as $dead) {
                if ($dead->isFile()) {
                    $this->disk->delete($dead->key);
                }

                $dead->forceDelete();
            }
        });
    }
}
