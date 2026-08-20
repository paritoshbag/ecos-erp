<?php

namespace App\Actions\Users;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class StoreUserAvatarAction
{
    public function handle(User $user, UploadedFile $file): User
    {
        $previous = $user->avatar_path;
        $path = $file->store('avatars', 'public');

        abort_unless(is_string($path) && $path !== '', 500);

        $user->forceFill([
            'avatar_path' => $path,
        ])->save();

        if ($previous !== null && $previous !== $path) {
            Storage::disk('public')->delete($previous);
        }

        return $user->refresh();
    }
}
