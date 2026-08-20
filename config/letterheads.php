<?php

use App\Enums\LetterheadLayout;

return [

    /*
    |--------------------------------------------------------------------------
    | Letterhead Disk
    |--------------------------------------------------------------------------
    |
    | Scans and logos are stored on the dedicated "letterheads" filesystem
    | disk. Point that disk at S3 in production by setting LETTERHEAD_DISK=s3.
    |
    */

    'disk' => 'letterheads',

    /*
    |--------------------------------------------------------------------------
    | Upload Limits
    |--------------------------------------------------------------------------
    |
    | Maximum upload size in kilobytes.
    |
    */

    'max_scan_kilobytes' => (int) env('LETTERHEAD_MAX_SCAN_KILOBYTES', 10240),
    'max_logo_kilobytes' => (int) env('LETTERHEAD_MAX_LOGO_KILOBYTES', 2048),

    'scan_mimes' => ['jpeg', 'jpg', 'png', 'webp'],
    'logo_mimes' => ['jpeg', 'jpg', 'png', 'webp'],

    /*
    |--------------------------------------------------------------------------
    | Default Writable Area
    |--------------------------------------------------------------------------
    |
    | Percent of the page used as the report body on a scanned letterhead.
    |
    */

    'default_writable' => [
        'top' => 18.0,
        'left' => 8.0,
        'width' => 84.0,
        'height' => 65.0,
    ],

    /*
    |--------------------------------------------------------------------------
    | Organization Tokens
    |--------------------------------------------------------------------------
    */

    'tokens' => [
        'company_name',
        'gst',
        'pan',
        'address',
        'email',
        'website',
        'mobile',
        'secondary_mobile',
        'company_type',
        'vendor_code',
        'field1',
        'field2',
        'field3',
        'field4',
        'field5',
    ],

    /*
    |--------------------------------------------------------------------------
    | Designed Presets
    |--------------------------------------------------------------------------
    */

    'presets' => [
        'classic' => [
            'name' => 'Classic',
            'description' => 'Logo on the left, company details on the right.',
            'header' => [
                'layout' => LetterheadLayout::Classic->value,
                'lines' => [
                    '{{company_name}}',
                    '{{address}}',
                    'GSTIN {{gst}}  ·  PAN {{pan}}',
                ],
            ],
            'footer' => [
                'lines' => [
                    '{{email}}  ·  {{mobile}}',
                    '{{website}}',
                ],
            ],
        ],
        'centered' => [
            'name' => 'Centered',
            'description' => 'Name, address and tax details stacked in the centre.',
            'header' => [
                'layout' => LetterheadLayout::Centered->value,
                'lines' => [
                    '{{company_name}}',
                    '{{address}}',
                    'GSTIN {{gst}}  ·  PAN {{pan}}  ·  Vendor {{vendor_code}}',
                ],
            ],
            'footer' => [
                'lines' => [
                    '{{email}}  ·  {{mobile}}  ·  {{website}}',
                ],
            ],
        ],
        'banner' => [
            'name' => 'Banner',
            'description' => 'Full-width name bar with compact details below.',
            'header' => [
                'layout' => LetterheadLayout::Banner->value,
                'lines' => [
                    '{{company_name}}',
                    '{{address}}',
                    'GSTIN {{gst}}  ·  PAN {{pan}}',
                ],
            ],
            'footer' => [
                'lines' => [
                    'This document is issued on company stationery.',
                    '{{email}}  ·  {{mobile}}',
                ],
            ],
        ],
        'compact' => [
            'name' => 'Compact',
            'description' => 'Thin header so more of the page is available for the report.',
            'header' => [
                'layout' => LetterheadLayout::Compact->value,
                'lines' => [
                    '{{company_name}}  ·  {{vendor_code}}',
                    'GSTIN {{gst}}  ·  PAN {{pan}}  ·  {{mobile}}',
                ],
            ],
            'footer' => [
                'lines' => [
                    '{{address}}  ·  {{email}}',
                ],
            ],
        ],
    ],

];
