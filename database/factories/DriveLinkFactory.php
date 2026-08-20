<?php

namespace Database\Factories;

use App\Models\DriveItem;
use App\Models\DriveLink;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<DriveLink>
 */
class DriveLinkFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'drive_item_id' => DriveItem::factory(),
            'token' => Str::lower(Str::random(64)),
            'expires_at' => null,
            'created_by' => User::factory(),
        ];
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes): array => [
            'expires_at' => now()->subHour(),
        ]);
    }
}
