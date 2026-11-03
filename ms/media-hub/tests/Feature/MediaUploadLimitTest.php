<?php

namespace Tests\Feature;

require_once __DIR__ . '/../../app/Models/MediaAsset.php';
require_once __DIR__ . '/../../app/Services/MinioStorageService.php';

use App\Services\MinioStorageService;

class MediaUploadLimitTest
{
    public function run(): void
    {
        $this->testSuccessfulUploadUnder5MB();
        $this->testRejectOversizedUploadExceeding5MB();
        $this->testRejectUnsupportedMimeType();
        $this->testPresignedUrlGeneration();
        echo "PASS: MediaUploadLimitTest completado exitosamente (4/4 casos verificados).\n";
    }

    public function testSuccessfulUploadUnder5MB(): void
    {
        $service = new MinioStorageService();

        $file = [
            'name' => 'dune_imax_official.jpg',
            'size' => 2.4 * 1024 * 1024, // 2.4 MB < 5 MB
            'mime' => 'image/jpeg',
        ];

        $asset = $service->uploadPoster($file, 'mov-001');

        assert(!empty($asset->id), "El asset debe tener ID");
        assert($asset->movieId === 'mov-001');
        assert($asset->dimensions === '300x450', "Las dimensiones de miniatura deben ser 300x450");
        assert(strpos($asset->thumbnailUrl, 'thumbnails/') !== false);
        assert(strpos($asset->originalUrl, 'posters/') !== false);
    }

    public function testRejectOversizedUploadExceeding5MB(): void
    {
        $service = new MinioStorageService();

        $heavyFile = [
            'name' => 'giant_poster_4k.png',
            'size' => 7.8 * 1024 * 1024, // 7.8 MB > 5 MB
            'mime' => 'image/png',
        ];

        $caught = false;
        try {
            $service->uploadPoster($heavyFile, 'mov-001');
        } catch (\DomainException $e) {
            $caught = true;
            assert(strpos($e->getMessage(), 'supera el tamaño máximo permitido de 5 MB') !== false);
        }

        assert($caught === true, "Debe lanzar DomainException ante archivo > 5MB");
    }

    public function testRejectUnsupportedMimeType(): void
    {
        $service = new MinioStorageService();

        $invalidFile = [
            'name' => 'document.pdf',
            'size' => 500 * 1024,
            'mime' => 'application/pdf',
        ];

        $caught = false;
        try {
            $service->uploadPoster($invalidFile, 'mov-001');
        } catch (\DomainException $e) {
            $caught = true;
            assert(strpos($e->getMessage(), 'Tipo de archivo no permitido') !== false);
        }

        assert($caught === true, "Debe rechazar archivos que no sean JPEG, PNG o WEBP");
    }

    public function testPresignedUrlGeneration(): void
    {
        $service = new MinioStorageService();
        $presigned = $service->generatePresignedDownloadUrl('poster_sample.jpg', 30);

        assert(strpos($presigned, 'presigned_token=') !== false);
        assert(strpos($presigned, 'expires=30m') !== false);
    }
}

if (php_sapi_name() === 'cli' && basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'] ?? '')) {
    $test = new MediaUploadLimitTest();
    $test->run();
}
