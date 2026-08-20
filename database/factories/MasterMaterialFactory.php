<?php

namespace Database\Factories;

use App\Models\MasterMaterial;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<MasterMaterial>
 */
class MasterMaterialFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => 'F'.fake()->unique()->numerify('#########'),
            'description' => Str::upper(fake()->sentence(4)),
            'unit' => fake()->randomElement(['NOS', 'KM', 'SET', 'MT']),
            'price' => fake()->randomFloat(2, 1, 200000),
        ];
    }
}
