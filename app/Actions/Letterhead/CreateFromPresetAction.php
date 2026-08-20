<?php

namespace App\Actions\Letterhead;

use App\Enums\LetterheadType;
use App\Enums\PaperSize;
use App\Models\Letterhead;
use App\Services\Letterhead\LetterheadService;

class CreateFromPresetAction
{
    public function __construct(
        private LetterheadService $letterheads,
        private ActivateLetterheadAction $activate,
    ) {}

    public function handle(string $presetKey, bool $activate = true): Letterhead
    {
        $preset = $this->letterheads->preset($presetKey);

        $letterhead = Letterhead::query()->firstOrCreate(
            [
                'source_preset' => $presetKey,
                'is_custom' => false,
                'type' => LetterheadType::Designed,
            ],
            [
                'name' => $preset['name'],
                'paper_size' => PaperSize::A4,
                'header' => $preset['header'],
                'footer' => $preset['footer'],
            ],
        );

        if ($activate) {
            $this->activate->handle($letterhead);
        }

        return $letterhead->refresh();
    }
}
