<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MediaAssetController;
use App\Http\Controllers\TicketController;

/*
|--------------------------------------------------------------------------
| Web Routes — Módulo 03: ms/media-hub (Puerto 8080)
|--------------------------------------------------------------------------
| Rutas Inertia.js para la consola de medios y terminal POS de confitería.
*/

// Redirección inicial hacia la consola multimedia
Route::get('/', function () {
    return redirect('/admin/media');
});

// Consola de Administración de Afiches y Miniaturas
Route::get('/admin/media', [MediaAssetController::class, 'index'])->name('media.index');
Route::post('/admin/media/upload', [MediaAssetController::class, 'upload'])->name('media.upload');
Route::get('/admin/media/presigned', [MediaAssetController::class, 'getPresignedUrl'])->name('media.presigned');

// Terminal POS de Canje Rápido de Confitería para Cajero (ROLE_CASHIER)
Route::get('/pos/candy-scan', [TicketController::class, 'scanner'])->name('pos.candy-scan');
Route::post('/pos/candy-redeem', [TicketController::class, 'redeem'])->name('pos.candy-redeem');

// Visor In-App de Boletos con Doble QR
Route::get('/tickets/{code}', [TicketController::class, 'show'])->name('tickets.show');
