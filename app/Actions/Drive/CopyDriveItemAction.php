<?php

namespace App\Actions\Drive;

use App\Models\DriveItem;
use App\Models\User;
use App\Services\Drive\DriveDisk;
use App\Support\DriveName;
use Illuminate\Support\Facades\DB;

class CopyDriveItemAction
{
    public function __construct(private DriveDisk $disk) {}

    public function handle(DriveItem $item, User $user, ?DriveItem $destination): DriveItem
    {
        return DB::transaction(fn (): DriveItem => $this->copyOne($item, $user, $destination));
    }

    private function copyOne(DriveItem $item, User $user, ?DriveItem $destination): DriveItem
    {
        $copy = $item->replicate(['path']);
        $copy->parent_id = $destination?->id;
        $copy->user_id = $user->id;
        $copy->name = DriveName::available($item->name, $destination?->id);
        $copy->path = '/';

        if ($item->isFile() && $item->key !== null) {
            $copy->key = $this->disk->copy($item->key);
            $copy->disk = (string) config('drive.disk');
        }

        $copy->save();

        if ($item->isFolder()) {
            $item->children()->each(function (DriveItem $child) use ($user, $copy): void {
                $this->copyOne($child, $user, $copy);
            });
        }

        return $copy;
    }
}
