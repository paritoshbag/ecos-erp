<?php

namespace App\Actions\Letterhead;

use App\Models\Letterhead;
use Illuminate\Support\Facades\DB;

class ActivateLetterheadAction
{
    public function handle(Letterhead $letterhead): void
    {
        DB::transaction(function () use ($letterhead): void {
            Letterhead::query()->where('is_active', true)->update(['is_active' => false]);

            $letterhead->forceFill(['is_active' => true])->save();
        });
    }
}
