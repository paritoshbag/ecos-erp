<?php

namespace Database\Seeders;

use App\Models\MasterMaterial;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\File;

class MasterMaterialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /** @var list<array{id: int, code: string, description: string, unit: string, price: string}> $records */
        $records = json_decode(
            File::get(database_path('data/master_materials.json')),
            true,
            512,
            JSON_THROW_ON_ERROR,
        );

        collect($records)
            ->chunk(100)
            ->each(function (Collection $chunk): void {
                MasterMaterial::query()->upsert(
                    $chunk->all(),
                    uniqueBy: ['id'],
                    update: ['code', 'description', 'unit', 'price'],
                );
            });
    }
}
