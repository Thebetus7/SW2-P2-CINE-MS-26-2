<!DOCTYPE html>
<html lang="es" class="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Cine Center — Multimedia & Boletos Digitales (Puerto 8080)</title>

    <meta name="description" content="Módulo 03: Monolito fullstack de administración de afiches MinIO S3, emisión de boletos con doble QR y terminal POS de confitería.">

    <!-- Tipografía Moderna -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">

    <style>
        body {
            font-family: 'Outfit', sans-serif;
            background-color: #020617;
            color: #f8fafc;
        }
        code, pre, .font-mono {
            font-family: 'JetBrains Mono', monospace;
        }
    </style>

    @vite(['resources/js/app.js'])
    @inertiaHead
</head>
<body class="antialiased bg-slate-950 text-slate-100 min-h-screen">
    @inertia
</body>
</html>
