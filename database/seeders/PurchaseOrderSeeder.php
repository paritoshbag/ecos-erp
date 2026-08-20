<?php

namespace Database\Seeders;

use App\Models\PurchaseOrder;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\File;

class PurchaseOrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /** @var list<array<string, mixed>> $records */
        $records = json_decode(
            File::get(database_path('data/purchase_orders.json')),
            true,
            512,
            JSON_THROW_ON_ERROR,
        );

        $update = array_values(array_diff(array_keys($records[0]), ['id']));

        collect($records)
            ->chunk(10)
            ->each(function (Collection $chunk) use ($update): void {
                PurchaseOrder::query()->upsert(
                    $chunk->all(),
                    uniqueBy: ['id'],
                    update: $update,
                );
            });
    }
}
