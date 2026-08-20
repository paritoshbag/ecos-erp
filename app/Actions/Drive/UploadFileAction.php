<?php

namespace App\Actions\Drive;

use App\Enums\DriveItemType;
use App\Models\DriveItem;
use App\Models\User;
use App\Services\Drive\DriveDisk;
use App\Support\DriveName;
use Illuminate\Http\UploadedFile;

class UploadFileAction
{
    public function __construct(private DriveDisk $disk) {}

    public function handle(User $user, UploadedFile $file, ?DriveItem $parent): DriveItem
    {
        $stored = $this->disk->store($file);

        return DriveItem::query()->create([
            'parent_id' => $parent?->id,
            'type' => DriveItemType::File,
            'name' => DriveName::display($file->getClientOriginalName()),
            'user_id' => $user->id,
            'path' => '/',
            'disk' => $stored['disk'],
            'key' => $stored['key'],
            'mime_type' => $stored['mime_type'],
            'size' => $stored['size'],
        ]);
    }
}
