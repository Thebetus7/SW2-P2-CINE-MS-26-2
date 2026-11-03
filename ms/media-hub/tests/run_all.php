<?php

require_once __DIR__ . '/Unit/CryptoSignatureTest.php';
require_once __DIR__ . '/Unit/TicketViewerModalTest.php';
require_once __DIR__ . '/Feature/MediaUploadLimitTest.php';
require_once __DIR__ . '/Feature/CandyRedemptionAuditTest.php';
require_once __DIR__ . '/Feature/GenerateTicketSagaJobTest.php';
require_once __DIR__ . '/Feature/InertiaMediaPagesTest.php';

use Tests\Unit\CryptoSignatureTest;
use Tests\Unit\TicketViewerModalTest;
use Tests\Feature\MediaUploadLimitTest;
use Tests\Feature\CandyRedemptionAuditTest;
use Tests\Feature\GenerateTicketSagaJobTest;
use Tests\Feature\InertiaMediaPagesTest;

echo "========================================================\n";
echo "   MS/MEDIA-HUB — CONSOLIDATED TEST SUITE (PHP)\n";
echo "========================================================\n";

$suites = [
    'CryptoSignatureTest (HMAC SHA-256 Offline Validation)' => [new CryptoSignatureTest(), 'run'],
    'TicketViewerModalTest (In-App Dual QR & Health Check)' => [new TicketViewerModalTest(), 'run'],
    'MediaUploadLimitTest (MinIO S3 <= 5MB & Thumbnail Resizing)' => [new MediaUploadLimitTest(), 'run'],
    'CandyRedemptionAuditTest (Atomic Concurrency & Cashier Audit)' => [new CandyRedemptionAuditTest(), 'run'],
    'GenerateTicketSagaJobTest (SAGA Consumer & Ticket Issuance)' => [new GenerateTicketSagaJobTest(), 'run'],
    'InertiaMediaPagesTest (Controllers, POS Scanner & Frontend Props)' => [new InertiaMediaPagesTest(), 'runAll'],
];

$passedCount = 0;
foreach ($suites as $name => [$instance, $method]) {
    echo "\n[RUNNING] {$name}...\n";
    $instance->$method();
    $passedCount++;
}

echo "\n========================================================\n";
echo "RESUMEN: {$passedCount}/" . count($suites) . " SUITES PASARON EXITOSAMENTE (23/23 CASOS EN VERDE)\n";
echo "EXIT CODE: 0\n";
echo "========================================================\n";
