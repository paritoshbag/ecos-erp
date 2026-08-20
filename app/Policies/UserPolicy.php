<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can view the users module.
     */
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can view the given account.
     */
    public function view(User $user, User $model): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can create accounts.
     */
    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can update the given account.
     */
    public function update(User $user, User $model): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can disable or enable the given account.
     */
    public function disable(User $user, User $model): bool
    {
        return $user->isSuperAdmin() && $user->isNot($model);
    }

    /**
     * Determine whether the user can send a password reset email.
     */
    public function resetPassword(User $user, User $model): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can upload or remove an avatar.
     */
    public function uploadAvatar(User $user, User $model): bool
    {
        return $user->isSuperAdmin();
    }
}
