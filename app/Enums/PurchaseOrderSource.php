<?php

namespace App\Enums;

enum PurchaseOrderSource: string
{
    case Manual = 'manual';
    case Import = 'import';
}
