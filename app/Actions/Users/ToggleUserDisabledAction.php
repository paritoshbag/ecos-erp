<?php

namespace App\Actions\Users;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ToggleUserDisabledAction
{
    public function handle(User $user): User
    {
        $shouldDisable = ! $user->is_disabled;

        if ($shouldDisable && $this->isLastEnabledSuperAdmin($user)) {
            throw ValidationException::withMessages([
                'user' => __('The last enabled superadmin cannot be disabled.'),
            ]);
        }

        $user->forceFill([
            'disabled_at' => $shouldDisable ? now() : null,
        ])->save();

        if ($shouldDisable) {
            DB::table((string) config('session.table', 'sessions'))
                ->where('user_id', $user->id)
                ->delete();
        }

        return $user->refresh();
    }

    private function isLastEnabledSuperAdmin(User $user): bool
    {
        if ($user->role !== UserRole::SuperAdmin || $user->is_disabled) {
            return false;
        }

        return ! User::query()
            ->where('role', UserRole::SuperAdmin)
            ->whereNull('disabled_at')
            ->whereKeyNot($user->id)
            ->exists();
    }
}
