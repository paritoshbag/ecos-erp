<?php

namespace App\Actions\Users;

use App\Models\User;
use Illuminate\Support\Facades\Storage;

class DeleteUserAvatarAction
{
    public function handle(User $user): User
    {
        $previous = $user->avatar_path;

        $user->forceFill([
            'avatar_path' => null,
        ])->save();

        if ($previous !== null) {
            Storage::disk('public')->delete($previous);
        }

        return $user->refresh();
    }
}
