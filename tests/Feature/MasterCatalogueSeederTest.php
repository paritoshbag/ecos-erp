<?php

namespace Tests\Feature;

use App\Models\MasterLabour;
use App\Models\MasterMaterial;
use Database\Seeders\MasterLabourSeeder;
use Database\Seeders\MasterMaterialSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MasterCatalogueSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_seeds_the_legacy_labour_and_material_catalogues(): void
    {
        $this->seed([
            MasterLabourSeeder::class,
            MasterMaterialSeeder::class,
        ]);

        $this->assertSame(335, MasterLabour::query()->count());
        $this->assertSame(351, MasterMaterial::query()->count());

        $noLabour = MasterLabour::query()->find(1000);

        $this->assertNotNull($noLabour);
        $this->assertSame('NO LABOUR', $noLabour->description);
        $this->assertSame('NOS', $noLabour->unit);
        $this->assertSame('1.00', $noLabour->price);

        $angle = MasterMaterial::query()->where('code', '0101011011')->first();

        $this->assertNotNull($angle);
        $this->assertSame('M.S ANGLE 50 X 50 X 6MM.', $angle->description);
        $this->assertSame('MT', $angle->unit);
        $this->assertSame('64750.08', $angle->price);
    }

    public function test_catalogue_seeders_are_idempotent(): void
    {
        $this->seed([
            MasterLabourSeeder::class,
            MasterMaterialSeeder::class,
        ]);

        $this->seed([
            MasterLabourSeeder::class,
            MasterMaterialSeeder::class,
        ]);

        $this->assertSame(335, MasterLabour::query()->count());
        $this->assertSame(351, MasterMaterial::query()->count());
    }

    public function test_factories_can_create_additional_catalogue_rows(): void
    {
        $this->seed([
            MasterLabourSeeder::class,
            MasterMaterialSeeder::class,
        ]);

        $labour = MasterLabour::factory()->create();
        $material = MasterMaterial::factory()->create();

        $this->assertModelExists($labour);
        $this->assertModelExists($material);
        $this->assertSame(336, MasterLabour::query()->count());
        $this->assertSame(352, MasterMaterial::query()->count());
    }
}
