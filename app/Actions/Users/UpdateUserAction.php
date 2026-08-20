<?php

namespace App\Actions\Users;

use App\Models\User;

class UpdateUserAction
{
    /**
     * @param  array{name: string, email: string}  $data
     */
    public function handle(User $user, array $data): User
    {
        $user->fill($data);

        if ($user->isDirty('email')) {
            $user->forceFill([
                'email_verified_at' => now(),
            ]);
        }

        $user->save();

        return $user->refresh();
    }
}
