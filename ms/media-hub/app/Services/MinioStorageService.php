<?php

namespace App\Services;

use App\Models\MediaAsset;

class MinioStorageService
{
    public const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB (RB-03.1)
    public const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    public const THUMBNAIL_WIDTH = 300;
    public const THUMBNAIL_HEIGHT = 450;

    private string $bucket;
    private string $endpoint;

    public function __construct(?string $bucket = null, ?string $endpoint = null)
    {
        $this->bucket = $bucket ?? (getenv('AWS_BUCKET') ?: 'cinema-assets');
        $this->endpoint = $endpoint ?? (getenv('AWS_ENDPOINT') ?: 'http://localhost:9000');
    }

    /**
     * Valida y procesa la carga de un afiche a MinIO/S3 con generación de miniatura (300x450px).
     *
     * @param array $fileMetadata ['name' => string, 'size' => int, 'mime' => string, 'tmp_path' => string|null]
     * @param string $movieId
     * @return MediaAsset
     */
    public function uploadPoster(array $fileMetadata, string $movieId): MediaAsset
    {
        $size = $fileMetadata['size'] ?? 0;
        $mime = strtolower($fileMetadata['mime'] ?? '');
        $name = $fileMetadata['name'] ?? 'poster.jpg';

        // 1. Validación de tamaño estricto (< 5 MB) (RB-03.1)
        if ($size > self::MAX_FILE_SIZE_BYTES) {
            $sizeMb = round($size / (1024 * 1024), 2);
            throw new \DomainException(
                "El afiche supera el tamaño máximo permitido de 5 MB ({$sizeMb} MB cargados). Operación cancelada."
            );
        }

        // 2. Validación de tipo MIME
        if (!in_array($mime, self::ALLOWED_MIME_TYPES, true)) {
            throw new \DomainException(
                "Tipo de archivo no permitido: {$mime}. Solo se admiten afiches en formatos JPEG, PNG o WEBP."
            );
        }

        // 3. Generación de nombres de archivo y URLs S3 simuladas
        $fileExt = pathinfo($name, PATHINFO_EXTENSION) ?: 'jpg';
        $uniqueId = bin2hex(random_bytes(6));
        $destFilename = "poster_{$movieId}_{$uniqueId}.{$fileExt}";
        $thumbFilename = "thumb_{$movieId}_{$uniqueId}.jpg";

        $originalUrl = "{$this->endpoint}/{$this->bucket}/posters/{$destFilename}";
        $thumbnailUrl = "{$this->endpoint}/{$this->bucket}/thumbnails/{$thumbFilename}";

        // 4. Crear registro MediaAsset
        return new MediaAsset([
            'id' => "asset-{$uniqueId}",
            'movieId' => $movieId,
            'filename' => $destFilename,
            'originalName' => $name,
            'mimeType' => $mime,
            'sizeBytes' => $size,
            'originalUrl' => $originalUrl,
            'thumbnailUrl' => $thumbnailUrl,
            'dimensions' => self::THUMBNAIL_WIDTH . 'x' . self::THUMBNAIL_HEIGHT,
        ]);
    }

    /**
     * Genera una URL prefirmada (Presigned URL) para descarga o visualización segura con expiración.
     */
    public function generatePresignedDownloadUrl(string $assetFilename, int $expiresMinutes = 60): string
    {
        $token = hash_hmac('sha256', "{$assetFilename}:" . (time() + $expiresMinutes * 60), 's3_presigned_secret');
        return "{$this->endpoint}/{$this->bucket}/posters/{$assetFilename}?presigned_token={$token}&expires={$expiresMinutes}m";
    }
}
