<?php

namespace App\Policies;

use App\Models\Letterhead;
use App\Models\User;

class LetterheadPolicy
{
    /**
     * Determine whether the user can view the letterhead settings page.
     */
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can view the letterhead.
     */
    public function view(User $user, Letterhead $letterhead): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can create letterheads.
     */
    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can update the letterhead.
     */
    public function update(User $user, Letterhead $letterhead): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can delete the letterhead.
     */
    public function delete(User $user, Letterhead $letterhead): bool
    {
        return $user->isSuperAdmin();
    }
}
