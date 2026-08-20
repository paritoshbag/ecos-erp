<?php

namespace App\Services\Letterhead;

use App\Enums\LetterheadLayout;
use App\Models\Letterhead;
use App\Models\Organization;
use Illuminate\Support\Str;
use InvalidArgumentException;

class LetterheadService
{
    /**
     * @return array<string, array{key: string, name: string, description: string, header: array{layout: string, lines: list<string>}, footer: array{lines: list<string>}}>
     */
    public function presets(): array
    {
        /** @var array<string, array{name: string, description: string, header: array{layout: string, lines: list<string>}, footer: array{lines: list<string>}}> $presets */
        $presets = config('letterheads.presets');

        $result = [];

        foreach ($presets as $key => $preset) {
            $result[$key] = [
                'key' => $key,
                ...$preset,
            ];
        }

        return $result;
    }

    /**
     * @return array{key: string, name: string, description: string, header: array{layout: string, lines: list<string>}, footer: array{lines: list<string>}}
     */
    public function preset(string $key): array
    {
        $presets = $this->presets();

        if (! isset($presets[$key])) {
            throw new InvalidArgumentException("Unknown letterhead preset [{$key}].");
        }

        return $presets[$key];
    }

    /**
     * @return list<string>
     */
    public function tokens(): array
    {
        /** @var list<string> $tokens */
        $tokens = config('letterheads.tokens');

        return $tokens;
    }

    /**
     * @return array<string, string>
     */
    public function tokenValues(Organization $organization): array
    {
        $values = [];

        foreach ($this->tokens() as $token) {
            $value = $organization->getAttribute($token);
            $values[$token] = is_scalar($value) ? (string) $value : '';
        }

        return $values;
    }

    public function substitute(string $text, Organization $organization): string
    {
        $values = $this->tokenValues($organization);

        return (string) preg_replace_callback(
            '/\{\{([a-z0-9_]+)\}\}/i',
            function (array $matches) use ($values): string {
                $key = Str::lower($matches[1]);

                return $values[$key] ?? '';
            },
            $text,
        );
    }

    /**
     * @return array{top: float, left: float, width: float, height: float}
     */
    public function contentBox(Letterhead $letterhead): array
    {
        if ($letterhead->isScanned()) {
            return [
                'top' => $letterhead->writable_top,
                'left' => $letterhead->writable_left,
                'width' => $letterhead->writable_width,
                'height' => $letterhead->writable_height,
            ];
        }

        return match ($letterhead->layout()) {
            LetterheadLayout::Compact => ['top' => 12.0, 'left' => 8.0, 'width' => 84.0, 'height' => 76.0],
            LetterheadLayout::Banner => ['top' => 18.0, 'left' => 8.0, 'width' => 84.0, 'height' => 70.0],
            LetterheadLayout::Centered => ['top' => 22.0, 'left' => 8.0, 'width' => 84.0, 'height' => 66.0],
            LetterheadLayout::Classic => ['top' => 20.0, 'left' => 8.0, 'width' => 84.0, 'height' => 68.0],
        };
    }

    /**
     * @param  list<string>  $lines
     * @return list<string>
     */
    public function sanitizeLines(array $lines): array
    {
        $clean = [];

        foreach ($lines as $line) {
            $stripped = trim(strip_tags($line));

            if ($stripped === '') {
                continue;
            }

            $clean[] = Str::limit($stripped, 200, '');
        }

        return array_slice($clean, 0, 12);
    }
}
