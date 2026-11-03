<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\MediaAssetController;

/*
|--------------------------------------------------------------------------
| API Routes — Módulo 03: ms/media-hub (Puerto 8080)
|--------------------------------------------------------------------------
| Endpoints REST consumidos por servicios internos, orquestador SAGA y semáforo.
*/

// Semáforo de Salud Visual del Microservicio
Route::get('/health', [HealthController::class, 'getHealth']);

// Consulta de Boletos Digitales y Doble QR
Route::get('/tickets/{code}', [TicketController::class, 'show']);

// Canje de Confitería via REST
Route::post('/pos/candy-redeem', [TicketController::class, 'redeem']);

// Listado de Activos Multimedia para Consumo de Cinema-Core
Route::get('/media/assets', [MediaAssetController::class, 'index']);
Route::post('/media/upload', [MediaAssetController::class, 'upload']);
