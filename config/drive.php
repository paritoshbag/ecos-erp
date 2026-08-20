<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Drive Disk
    |--------------------------------------------------------------------------
    |
    | Files are stored on the dedicated "drive" filesystem disk. Point that
    | disk at S3 in production by setting DRIVE_DISK=s3.
    |
    */

    'disk' => 'drive',

    /*
    |--------------------------------------------------------------------------
    | Upload Limit
    |--------------------------------------------------------------------------
    |
    | Maximum upload size in kilobytes. 102400 = 100 MB.
    |
    */

    'max_upload_kilobytes' => (int) env('DRIVE_MAX_UPLOAD_KILOBYTES', 102400),

    /*
    |--------------------------------------------------------------------------
    | Previewable MIME Types
    |--------------------------------------------------------------------------
    */

    'preview_mimes' => [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
    ],

];
