<?php

namespace App\Http\Controllers;

class HealthController
{
    public function getHealth(): array
    {
        return [
            'status' => 'healthy',
            'service' => 'media-hub',
            'environment' => getenv('APP_ENV') ?: 'development',
            'port' => 8080,
            'storage' => [
                'minio' => 'connected',
                'bucket' => getenv('AWS_BUCKET') ?: 'cinema-assets',
            ],
            'database' => [
                'mongodb' => 'connected',
                'db_name' => getenv('DB_DATABASE') ?: 'media_hub',
            ],
            'timestamp' => gmdate('Y-m-d\TH:i:s\Z'),
        ];
    }
}
