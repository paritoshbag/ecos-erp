<?php

namespace Database\Factories;

use App\Models\MasterLabour;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<MasterLabour>
 */
class MasterLabourFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'description' => Str::upper(fake()->sentence(6)),
            'unit' => fake()->randomElement(['NOS', 'KM', 'SET', 'MT']),
            'price' => fake()->randomFloat(2, 1, 50000),
        ];
    }
}
