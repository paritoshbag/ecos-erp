<?php

namespace App\Actions\Letterhead;

use App\Models\Letterhead;
use App\Services\Letterhead\LetterheadDisk;
use Illuminate\Http\UploadedFile;

class StoreLetterheadLogoAction
{
    public function __construct(private LetterheadDisk $disk) {}

    public function handle(Letterhead $letterhead, UploadedFile $file): Letterhead
    {
        $previous = $letterhead->logo_key;
        $stored = $this->disk->store($file, 'logo');

        $letterhead->forceFill([
            'logo_disk' => $stored['disk'],
            'logo_key' => $stored['key'],
            'logo_mime' => $stored['mime_type'],
        ])->save();

        if ($previous !== null && $previous !== $stored['key']) {
            $this->disk->delete($previous);
        }

        return $letterhead->refresh();
    }
}
