<?php

namespace App\Policies;

use App\Models\DriveItem;
use App\Models\User;

class DriveItemPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, DriveItem $driveItem): bool
    {
        if ($driveItem->trashed()) {
            return $this->restore($user, $driveItem);
        }

        return true;
    }

    public function create(User $user, ?DriveItem $folder = null): bool
    {
        if ($folder === null) {
            return true;
        }

        return $folder->isFolder() && $this->update($user, $folder);
    }

    public function update(User $user, DriveItem $driveItem): bool
    {
        return $driveItem->editableBy($user);
    }

    public function delete(User $user, DriveItem $driveItem): bool
    {
        return $this->update($user, $driveItem);
    }

    public function restore(User $user, DriveItem $driveItem): bool
    {
        return $this->update($user, $driveItem);
    }

    public function forceDelete(User $user, DriveItem $driveItem): bool
    {
        return $user->isSuperAdmin() || $driveItem->user_id === $user->id;
    }

    public function share(User $user, DriveItem $driveItem): bool
    {
        return $this->update($user, $driveItem);
    }
}
