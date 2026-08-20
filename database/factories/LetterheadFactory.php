<?php

namespace Database\Factories;

use App\Enums\LetterheadLayout;
use App\Enums\LetterheadType;
use App\Enums\PaperSize;
use App\Models\Letterhead;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Letterhead>
 */
class LetterheadFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'type' => LetterheadType::Designed,
            'name' => 'Classic',
            'source_preset' => 'classic',
            'paper_size' => PaperSize::A4,
            'is_active' => false,
            'is_custom' => false,
            'header' => [
                'layout' => LetterheadLayout::Classic->value,
                'lines' => [
                    '{{company_name}}',
                    '{{address}}',
                    'GSTIN {{gst}}  ·  PAN {{pan}}',
                ],
            ],
            'footer' => [
                'lines' => [
                    '{{email}}  ·  {{mobile}}',
                    '{{website}}',
                ],
            ],
            'writable_top' => 18,
            'writable_left' => 8,
            'writable_width' => 84,
            'writable_height' => 65,
        ];
    }

    /**
     * Indicate that the letterhead is an editable copy.
     */
    public function custom(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_custom' => true,
            'name' => 'Copy of Classic',
        ]);
    }

    /**
     * Indicate that the letterhead is a scanned stationery page.
     */
    public function scanned(): static
    {
        $writable = config('letterheads.default_writable');

        return $this->state(fn (array $attributes): array => [
            'type' => LetterheadType::Scanned,
            'name' => 'Scanned letterhead',
            'source_preset' => null,
            'is_custom' => true,
            'header' => null,
            'footer' => null,
            'background_disk' => (string) config('letterheads.disk'),
            'background_key' => 'letterheads/demo.png',
            'background_mime' => 'image/png',
            'writable_top' => $writable['top'],
            'writable_left' => $writable['left'],
            'writable_width' => $writable['width'],
            'writable_height' => $writable['height'],
        ]);
    }

    /**
     * Indicate that this is the active letterhead.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_active' => true,
        ]);
    }
}
