<?php

namespace App\Actions\Drive;

use App\Enums\DriveItemType;
use App\Models\DriveItem;
use App\Models\User;

class CreateFolderAction
{
    public function handle(User $user, string $name, ?DriveItem $parent): DriveItem
    {
        return DriveItem::query()->create([
            'parent_id' => $parent?->id,
            'type' => DriveItemType::Folder,
            'name' => $name,
            'user_id' => $user->id,
            'path' => '/',
        ]);
    }
}
