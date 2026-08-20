<?php

namespace Database\Factories;

use App\Enums\PurchaseOrderSource;
use App\Models\PurchaseOrder;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<PurchaseOrder>
 */
class PurchaseOrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'po_number' => 'F'.fake()->unique()->numerify('#########'),
            'po_date' => fake()->date(),
            'order_type' => fake()->numberBetween(1, 10),
            'ccc' => fake()->randomElement(['KALNA', 'BDP', 'DHT', 'PBS', 'KMN', 'BTR', 'MNT', 'AET', 'SMG']),
            'description' => Str::upper(fake()->sentence(8)),
            'po_amount' => fake()->randomFloat(2, 0, 500000),
            'source' => PurchaseOrderSource::Manual,
        ];
    }

    /**
     * Indicate that the purchase order was created by file import.
     */
    public function imported(): static
    {
        return $this->state(fn (array $attributes): array => [
            'source' => PurchaseOrderSource::Import,
        ]);
    }
}
