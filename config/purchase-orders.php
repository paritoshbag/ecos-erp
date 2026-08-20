<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Purchase Order Disk
    |--------------------------------------------------------------------------
    |
    | Uploaded PO PDFs are stored on the dedicated "purchase-orders"
    | filesystem disk. Point that disk at S3 in production by setting
    | PURCHASE_ORDER_DISK=s3.
    |
    */

    'disk' => 'purchase-orders',

    /*
    |--------------------------------------------------------------------------
    | Upload Limit
    |--------------------------------------------------------------------------
    |
    | Maximum upload size in kilobytes. 10240 = 10 MB.
    |
    */

    'max_upload_kilobytes' => (int) env('PURCHASE_ORDER_MAX_UPLOAD_KILOBYTES', 10240),

    /*
    |--------------------------------------------------------------------------
    | CCC Aliases
    |--------------------------------------------------------------------------
    |
    | Customer Care Centre names extracted from WBSEDCL PDFs mapped to the
    | short codes already stored on purchase_orders.ccc (max 10 characters).
    |
    */

    'ccc_aliases' => [
        'BAIDYAPUR' => 'BDP',
        'PURBASTHALI' => 'PBS',
        'KALNA' => 'KALNA',
    ],

];
