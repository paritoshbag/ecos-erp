<?php

namespace App\Actions\Letterhead;

use App\Models\Letterhead;
use App\Services\Letterhead\LetterheadDisk;

class DuplicateLetterheadAction
{
    public function __construct(private LetterheadDisk $disk) {}

    public function handle(Letterhead $letterhead): Letterhead
    {
        $copy = $letterhead->replicate();
        $copy->name = 'Copy of '.$letterhead->name;
        $copy->is_custom = true;
        $copy->is_active = false;

        if ($letterhead->hasLogo() && is_string($letterhead->logo_key)) {
            $copy->logo_key = $this->disk->copy($letterhead->logo_key);
        }

        if ($letterhead->hasBackground() && is_string($letterhead->background_key)) {
            $copy->background_key = $this->disk->copy($letterhead->background_key);
        }

        $copy->save();

        return $copy;
    }
}
