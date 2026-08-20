<?php

namespace App\Actions\Users;

use App\Models\User;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class SendUserPasswordResetAction
{
    public function handle(User $user): void
    {
        if ($user->is_disabled) {
            throw ValidationException::withMessages([
                'email' => __('A disabled account cannot receive a password reset email.'),
            ]);
        }

        $status = Password::sendResetLink([
            'email' => $user->email,
        ]);

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages([
                'email' => __($status),
            ]);
        }
    }
}
