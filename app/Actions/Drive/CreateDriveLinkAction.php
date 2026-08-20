<?php

namespace App\Actions\Drive;

use App\Models\DriveItem;
use App\Models\DriveLink;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class CreateDriveLinkAction
{
    public function handle(DriveItem $item, User $user, ?Carbon $expiresAt = null): DriveLink
    {
        $existing = $item->links()->where(function (Builder $query): void {
            $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
        })->first();

        if ($existing !== null) {
            if ($expiresAt !== null) {
                $existing->update(['expires_at' => $expiresAt]);
            }

            return $existing->refresh();
        }

        return $item->links()->create([
            'token' => Str::lower(Str::random(64)),
            'expires_at' => $expiresAt,
            'created_by' => $user->id,
        ]);
    }
}
