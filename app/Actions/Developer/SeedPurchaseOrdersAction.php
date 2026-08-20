<?php

namespace App\Actions\Developer;

use Database\Seeders\PurchaseOrderSeeder;

class SeedPurchaseOrdersAction
{
    public function __construct(private PurchaseOrderSeeder $seeder) {}

    public function handle(): void
    {
        $this->seeder->run();
    }
}
