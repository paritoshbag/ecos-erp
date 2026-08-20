<?php

namespace Database\Factories;

use App\Enums\DriveItemType;
use App\Models\DriveItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * @extends Factory<DriveItem>
 */
class DriveItemFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'parent_id' => null,
            'type' => DriveItemType::Folder,
            'name' => fake()->unique()->words(2, true),
            'user_id' => User::factory(),
            'path' => '/',
            'disk' => null,
            'key' => null,
            'mime_type' => null,
            'size' => null,
        ];
    }

    public function folder(): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => DriveItemType::Folder,
            'disk' => null,
            'key' => null,
            'mime_type' => null,
            'size' => null,
        ]);
    }

    public function file(string $contents = 'test content', string $mime = 'text/plain', ?string $name = null): static
    {
        $filename = $name ?? fake()->unique()->word().'.txt';

        return $this->state(fn (array $attributes): array => [
            'type' => DriveItemType::File,
            'name' => $filename,
            'disk' => config('drive.disk'),
            'key' => 'drive/'.Str::uuid().'/'.basename($filename),
            'mime_type' => $mime,
            'size' => strlen($contents),
        ])->afterCreating(function (DriveItem $item) use ($contents): void {
            if ($item->key !== null) {
                Storage::disk($item->disk ?? config('drive.disk'))->put($item->key, $contents);
            }
        });
    }

    public function image(): static
    {
        return $this->file('fake-image', 'image/png', fake()->unique()->word().'.png');
    }

    public function pdf(): static
    {
        return $this->file('%PDF-1.4', 'application/pdf', fake()->unique()->word().'.pdf');
    }

    public function in(DriveItem $folder): static
    {
        return $this->state(fn (array $attributes): array => [
            'parent_id' => $folder->id,
        ]);
    }
}
