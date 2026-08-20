<?php

namespace Database\Seeders;

use App\Models\MasterLabour;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\File;

class MasterLabourSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /** @var list<array{id: int, description: string, unit: string, price: string}> $records */
        $records = json_decode(
            File::get(database_path('data/master_labours.json')),
            true,
            512,
            JSON_THROW_ON_ERROR,
        );

        collect($records)
            ->chunk(100)
            ->each(function (Collection $chunk): void {
                MasterLabour::query()->upsert(
                    $chunk->all(),
                    uniqueBy: ['id'],
                    update: ['description', 'unit', 'price'],
                );
            });
    }
}
