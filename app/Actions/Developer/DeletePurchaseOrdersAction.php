<?php

namespace App\Actions\Developer;

use App\Models\PurchaseOrder;

class DeletePurchaseOrdersAction
{
    public function handle(): void
    {
        PurchaseOrder::query()->delete();
    }
}
