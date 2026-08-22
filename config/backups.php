<?php

return [
    'default' => env('APP_BACKUP_DRIVER', 'wings'),

    'default_provider' => env('APP_BACKUP_PROVIDER', 'local'),

    'panel_auto_enabled' => (bool) env('PANEL_AUTO_BACKUP_ENABLED', false),
    'panel_auto_frequency' => env('PANEL_AUTO_BACKUP_FREQUENCY', 'daily'),

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

    'disks' => [
        'wings' => [
            'adapter' => 'wings',
        ],
        's3' => [
            'adapter' => 's3',
            'region' => env('AWS_DEFAULT_REGION', 'auto'),
            'key' => env('AWS_ACCESS_KEY_ID', ''),
            'secret' => env('AWS_SECRET_ACCESS_KEY', ''),
            'bucket' => env('AWS_BACKUPS_BUCKET', ''),
            'endpoint' => env('AWS_ENDPOINT', ''),
            'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
        ],
        'r2' => [
            'adapter' => 's3',
            'region' => 'auto',
            'key' => env('CLOUDFLARE_R2_ACCESS_KEY_ID', ''),
            'secret' => env('CLOUDFLARE_R2_SECRET_ACCESS_KEY', ''),
            'bucket' => env('CLOUDFLARE_R2_BUCKET', ''),
            'endpoint' => env('CLOUDFLARE_R2_ENDPOINT', ''),
            'use_path_style_endpoint' => false,
        ],
    ],
];
