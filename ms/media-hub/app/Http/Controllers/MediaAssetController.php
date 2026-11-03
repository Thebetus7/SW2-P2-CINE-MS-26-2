<?php

namespace App\Http\Controllers;

use App\Models\MediaAsset;
use App\Services\MinioStorageService;
use Database\Seeders\MediaHubDatabaseSeeder;

/**
 * T3.2 [IMPL] Controlador de Gestión Multimedia (PLAN-24, RB-03.1)
 * Gestiona la consola multimedia en Inertia/Vue 3 y la carga de afiches a MinIO S3.
 */
class MediaAssetController
{
    private MinioStorageService $storageService;
    /** @var array<string, MediaAsset> */
    private static array $assetStore = [];

    public function __construct(?MinioStorageService $storageService = null)
    {
        $this->storageService = $storageService ?? new MinioStorageService();
        $this->initializeStoreIfEmpty();
    }

    private function initializeStoreIfEmpty(): void
    {
        if (empty(self::$assetStore)) {
            $seeded = MediaHubDatabaseSeeder::seed();
            foreach ($seeded['assets'] as $asset) {
                self::$assetStore[$asset->id] = $asset;
            }
        }
    }

    /**
     * Lista todos los afiches disponibles para la consola Inertia (Media/Index)
     * Soporta filtrado por película o búsqueda diacrítica.
     *
     * @param string|null $query
     * @param string|null $movieId
     * @return array
     */
    public function index(?string $query = null, ?string $movieId = null): array
    {
        $assets = array_values(self::$assetStore);

        if ($movieId) {
            $assets = array_filter($assets, fn(MediaAsset $a) => $a->movieId === $movieId);
        }

        if ($query) {
            $normalizedQuery = mb_strtolower(trim($query), 'UTF-8');
            $assets = array_filter($assets, function (MediaAsset $a) use ($normalizedQuery) {
                $name = mb_strtolower($a->originalName, 'UTF-8');
                $filename = mb_strtolower($a->filename, 'UTF-8');
                return str_contains($name, $normalizedQuery) || str_contains($filename, $normalizedQuery);
            });
        }

        return [
            'assets' => array_map(fn(MediaAsset $a) => $a->toArray(), array_values($assets)),
            'total' => count($assets),
            'storageBucket' => 'cinema-assets',
            'endpoint' => 'http://localhost:9000',
        ];
    }

    /**
     * RB-03.1 / SC-01.1: Valida y procesa la carga de un afiche (< 5MB)
     * Genera miniatura 300x450px y registra el activo en el repositorio.
     *
     * @param array $fileMetadata ['name' => string, 'size' => int, 'mime' => string, 'tmp_path' => string|null]
     * @param string $movieId
     * @return array
     */
    public function upload(array $fileMetadata, string $movieId): array
    {
        $asset = $this->storageService->uploadPoster($fileMetadata, $movieId);
        self::$assetStore[$asset->id] = $asset;

        return [
            'status' => 'SUCCESS',
            'message' => '¡Afiche cargado exitosamente a MinIO S3 con miniatura generada!',
            'asset' => $asset->toArray(),
        ];
    }

    /**
     * Obtiene una URL prefirmada para descarga o visualización de un afiche
     *
     * @param string $filename
     * @param int $expiresMinutes
     * @return array
     */
    public function getPresignedUrl(string $filename, int $expiresMinutes = 60): array
    {
        $url = $this->storageService->generatePresignedDownloadUrl($filename, $expiresMinutes);
        return [
            'filename' => $filename,
            'presignedUrl' => $url,
            'expiresInMinutes' => $expiresMinutes,
        ];
    }

    /**
     * Reinicia el almacén estático para aislamiento de pruebas
     */
    public static function resetStore(): void
    {
        self::$assetStore = [];
    }
}
