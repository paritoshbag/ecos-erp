<?php

namespace Database\Factories;

use App\Enums\DrivePermission;
use App\Models\DriveItem;
use App\Models\DriveShare;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DriveShare>
 */
class DriveShareFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'drive_item_id' => DriveItem::factory(),
            'user_id' => User::factory(),
            'permission' => DrivePermission::Editor,
        ];
    }
}
