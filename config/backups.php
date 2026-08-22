<?php

return [
    'default_provider' => env('APP_BACKUP_PROVIDER', 'local'),

    'r2' => [
        'enabled' => (bool) env('CLOUDFLARE_R2_ENABLED', false),
        'account_id' => env('CLOUDFLARE_R2_ACCOUNT_ID', ''),
        'bucket' => env('CLOUDFLARE_R2_BUCKET', ''),
        'access_key_id' => env('CLOUDFLARE_R2_ACCESS_KEY_ID', ''),
        'secret_access_key' => env('CLOUDFLARE_R2_SECRET_ACCESS_KEY', ''),
        'endpoint' => env('CLOUDFLARE_R2_ENDPOINT', ''),
    ],

    'gdrive' => [
        'enabled' => (bool) env('GOOGLE_DRIVE_ENABLED', false),
        'client_id' => env('GOOGLE_DRIVE_CLIENT_ID', ''),
        'client_secret' => env('GOOGLE_DRIVE_CLIENT_SECRET', ''),
        'refresh_token' => env('GOOGLE_DRIVE_REFRESH_TOKEN', ''),
        'folder_id' => env('GOOGLE_DRIVE_FOLDER_ID', ''),
    ],
];
