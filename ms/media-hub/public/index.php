<?php

// 1. Servir archivos estáticos directamente si existen
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH));
$filePath = __DIR__ . $uri;

if ($uri !== '/' && file_exists($filePath) && !is_dir($filePath)) {
    return false; // Permite que el servidor embebido de PHP sirva el archivo
}

// 2. Autoloader de dependencias (Composer o fallback PSR-4)
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
} else {
    spl_autoload_register(function ($class) {
        $prefixes = [
            'App\\' => __DIR__ . '/../app/',
            'Database\\Seeders\\' => __DIR__ . '/../database/seeders/',
            'Tests\\' => __DIR__ . '/../tests/',
        ];
        foreach ($prefixes as $prefix => $baseDir) {
            $len = strlen($prefix);
            if (strncmp($prefix, $class, $len) === 0) {
                $relativeClass = substr($class, $len);
                $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';
                if (file_exists($file)) {
                    require_once $file;
                    return;
                }
            }
        }
    });
}

// 3. Cabeceras CORS comunes
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Inertia');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 4. Router API
if ($uri === '/api/health') {
    header('Content-Type: application/json; charset=utf-8');
    $controller = new \App\Http\Controllers\HealthController();
    echo json_encode($controller->getHealth(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($uri === '/api/media/assets') {
    header('Content-Type: application/json; charset=utf-8');
    $controller = new \App\Http\Controllers\MediaAssetController();
    echo json_encode($controller->index($_GET['q'] ?? null, $_GET['movieId'] ?? null), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($uri === '/api/media/upload' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json; charset=utf-8');
    $controller = new \App\Http\Controllers\MediaAssetController();
    $movieId = $_POST['movieId'] ?? 'MOV-AUTO-01';
    $file = $_FILES['file'] ?? null;
    $metadata = [
        'name' => $file['name'] ?? 'poster.jpg',
        'size' => $file['size'] ?? 1024,
        'mime' => $file['type'] ?? 'image/jpeg',
        'tmp_path' => $file['tmp_name'] ?? null,
    ];
    $result = $controller->upload($metadata, $movieId);
    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($uri === '/api/pos/candy-redeem' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json; charset=utf-8');
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?: $_POST;
    $controller = new \App\Http\Controllers\TicketController();
    $result = $controller->redeem(
        $input['code'] ?? '',
        $input['cashierId'] ?? 'cajero@test.com',
        $input['counterId'] ?? 'CAJA-01',
        $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
    );
    http_response_code($result['statusCode'] ?? 200);
    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

if (preg_match('#^/api/tickets/(.+)$#', $uri, $matches)) {
    header('Content-Type: application/json; charset=utf-8');
    $controller = new \App\Http\Controllers\TicketController();
    $result = $controller->show($matches[1]);
    http_response_code($result['statusCode'] ?? 200);
    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

// 5. Router Web / Inertia.js
if ($uri === '/' || $uri === '') {
    header('Location: /admin/media', true, 302);
    exit;
}

$pageData = null;
if ($uri === '/admin/media') {
    $controller = new \App\Http\Controllers\MediaAssetController();
    $pageData = [
        'component' => 'Media/Index',
        'props' => $controller->index($_GET['q'] ?? null, $_GET['movieId'] ?? null),
        'url' => '/admin/media',
        'version' => '1.0.0',
    ];
} elseif ($uri === '/pos/candy-scan') {
    $controller = new \App\Http\Controllers\TicketController();
    $pageData = [
        'component' => 'POS/CandyScan',
        'props' => $controller->scanner(),
        'url' => '/pos/candy-scan',
        'version' => '1.0.0',
    ];
} elseif (preg_match('#^/tickets/(.+)$#', $uri, $matches)) {
    $controller = new \App\Http\Controllers\TicketController();
    $ticketResult = $controller->show($matches[1]);
    $pageData = [
        'component' => 'Media/Index',
        'props' => [
            'ticket' => $ticketResult['ticket'] ?? null,
            'status' => $ticketResult['status'] ?? 'NOT_FOUND',
        ],
        'url' => $uri,
        'version' => '1.0.0',
    ];
}

// Si la petición es desde Inertia vía AJAX
$isInertia = isset($_SERVER['HTTP_X_INERTIA']) && $_SERVER['HTTP_X_INERTIA'] === 'true';
if ($isInertia && $pageData) {
    header('Content-Type: application/json; charset=utf-8');
    header('X-Inertia: true');
    echo json_encode($pageData);
    exit;
}

// Si es una carga inicial completa en el navegador, renderizamos el HTML de Inertia
if ($pageData) {
    $dataPageJson = htmlspecialchars(json_encode($pageData), ENT_QUOTES, 'UTF-8');
    header('Content-Type: text/html; charset=utf-8');
    ?>
<!DOCTYPE html>
<html lang="es" class="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Cine Center — Multimedia & Boletos Digitales (Puerto 8080)</title>
    <meta name="description" content="Módulo 03: Monolito fullstack de administración de afiches MinIO S3, emisión de boletos con doble QR y terminal POS de confitería.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/build/assets/app.css">
    <script type="module" src="/build/assets/app.js"></script>
    <style>
        body { font-family: 'Outfit', sans-serif; background-color: #020617; color: #f8fafc; }
        code, pre, .font-mono { font-family: 'JetBrains Mono', monospace; }
    </style>
</head>
<body class="antialiased bg-slate-950 text-slate-100 min-h-screen">
    <div id="app" data-page="<?= $dataPageJson ?>"></div>
</body>
</html>
<?php
    exit;
}

// 404 Fallback
http_response_code(404);
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['status' => 'NOT_FOUND', 'message' => "Ruta '{$uri}' no encontrada."], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

