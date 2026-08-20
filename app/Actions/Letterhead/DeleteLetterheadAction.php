<?php

namespace App\Actions\Letterhead;

use App\Models\Letterhead;
use App\Services\Letterhead\LetterheadDisk;
use Illuminate\Validation\ValidationException;

class DeleteLetterheadAction
{
    public function __construct(private LetterheadDisk $disk) {}

    public function handle(Letterhead $letterhead): void
    {
        if ($letterhead->is_active) {
            throw ValidationException::withMessages([
                'letterhead' => __('Activate another letterhead before deleting this one.'),
            ]);
        }

        $this->disk->delete($letterhead->logo_key);
        $this->disk->delete($letterhead->background_key);

        $letterhead->delete();
    }
}
