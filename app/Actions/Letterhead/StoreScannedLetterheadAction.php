<?php

namespace App\Actions\Letterhead;

use App\Enums\LetterheadType;
use App\Enums\PaperSize;
use App\Models\Letterhead;
use App\Services\Letterhead\LetterheadDisk;
use Illuminate\Http\UploadedFile;

class StoreScannedLetterheadAction
{
    public function __construct(private LetterheadDisk $disk) {}

    public function handle(UploadedFile $file, PaperSize $paperSize, string $name): Letterhead
    {
        $stored = $this->disk->store($file, 'background');

        /** @var array{top: float|int, left: float|int, width: float|int, height: float|int} $writable */
        $writable = config('letterheads.default_writable');

        return Letterhead::query()->create([
            'type' => LetterheadType::Scanned,
            'name' => $name,
            'paper_size' => $paperSize,
            'is_custom' => true,
            'is_active' => false,
            'background_disk' => $stored['disk'],
            'background_key' => $stored['key'],
            'background_mime' => $stored['mime_type'],
            'writable_top' => $writable['top'],
            'writable_left' => $writable['left'],
            'writable_width' => $writable['width'],
            'writable_height' => $writable['height'],
        ]);
    }
}
