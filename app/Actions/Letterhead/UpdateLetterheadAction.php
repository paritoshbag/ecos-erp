<?php

namespace App\Actions\Letterhead;

use App\Enums\PaperSize;
use App\Models\Letterhead;
use App\Services\Letterhead\LetterheadService;
use Illuminate\Validation\ValidationException;

class UpdateLetterheadAction
{
    public function __construct(private LetterheadService $letterheads) {}

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function handle(Letterhead $letterhead, array $attributes): Letterhead
    {
        if (! $letterhead->is_custom) {
            throw ValidationException::withMessages([
                'name' => __('Duplicate this letterhead to edit it.'),
            ]);
        }

        if (array_key_exists('name', $attributes) && is_string($attributes['name'])) {
            $letterhead->name = $attributes['name'];
        }

        if (array_key_exists('paper_size', $attributes) && is_string($attributes['paper_size'])) {
            $letterhead->paper_size = PaperSize::from($attributes['paper_size']);
        }

        if ($letterhead->isDesigned()) {
            if (isset($attributes['header']) && is_array($attributes['header'])) {
                $letterhead->header = [
                    'layout' => $attributes['header']['layout'] ?? $letterhead->layout()->value,
                    'lines' => $this->letterheads->sanitizeLines($attributes['header']['lines'] ?? []),
                ];
            }

            if (isset($attributes['footer']) && is_array($attributes['footer'])) {
                $letterhead->footer = [
                    'lines' => $this->letterheads->sanitizeLines($attributes['footer']['lines'] ?? []),
                ];
            }
        }

        if ($letterhead->isScanned()) {
            foreach (['writable_top', 'writable_left', 'writable_width', 'writable_height'] as $field) {
                if (array_key_exists($field, $attributes)) {
                    $letterhead->{$field} = (float) $attributes[$field];
                }
            }
        }

        $letterhead->save();

        return $letterhead->refresh();
    }
}
