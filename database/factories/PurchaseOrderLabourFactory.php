<?php

namespace Database\Factories;

use App\Models\MasterLabour;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderLabour;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<PurchaseOrderLabour>
 */
class PurchaseOrderLabourFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quantity = fake()->randomFloat(3, 0.001, 50);
        $rate = fake()->randomFloat(2, 1, 5000);

        return [
            'purchase_order_id' => PurchaseOrder::factory(),
            'master_labour_id' => MasterLabour::factory(),
            'line_no' => fake()->numberBetween(1, 80),
            'description' => Str::upper(fake()->sentence(6)),
            'hsn_sac' => null,
            'quantity' => $quantity,
            'unit' => fake()->randomElement(['NOS', 'KM', 'SET']),
            'rate' => $rate,
            'freight_and_insurance' => '0.00',
            'amount' => round($quantity * $rate, 2),
        ];
    }
}
