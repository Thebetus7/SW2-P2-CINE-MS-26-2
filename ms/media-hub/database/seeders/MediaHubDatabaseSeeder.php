<?php

namespace Database\Seeders;

use App\Models\DigitalTicket;
use App\Models\MediaAsset;

class MediaHubDatabaseSeeder
{
    public static function seed(): array
    {
        $assets = [
            new MediaAsset([
                'id' => 'asset-dune-01',
                'movieId' => 'mov-001',
                'filename' => 'dune2_poster_official.jpg',
                'originalName' => 'Dune Part Two IMAX Poster.jpg',
                'mimeType' => 'image/jpeg',
                'sizeBytes' => 2450000,
                'originalUrl' => 'http://localhost:9000/cinema-assets/posters/dune2_poster_official.jpg',
                'thumbnailUrl' => 'http://localhost:9000/cinema-assets/thumbnails/thumb_dune2.jpg',
                'dimensions' => '800x1200'
            ]),
            new MediaAsset([
                'id' => 'asset-gladiator-02',
                'movieId' => 'mov-002',
                'filename' => 'gladiator2_laser.jpg',
                'originalName' => 'Gladiator II 4K Laser.jpg',
                'mimeType' => 'image/jpeg',
                'sizeBytes' => 3120000,
                'originalUrl' => 'http://localhost:9000/cinema-assets/posters/gladiator2_laser.jpg',
                'thumbnailUrl' => 'http://localhost:9000/cinema-assets/thumbnails/thumb_gladiator2.jpg',
                'dimensions' => '800x1200'
            ]),
            new MediaAsset([
                'id' => 'asset-moana-03',
                'movieId' => 'mov-003',
                'filename' => 'moana2_family.jpg',
                'originalName' => 'Moana 2 Family Adventure.jpg',
                'mimeType' => 'image/jpeg',
                'sizeBytes' => 1890000,
                'originalUrl' => 'http://localhost:9000/cinema-assets/posters/moana2_family.jpg',
                'thumbnailUrl' => 'http://localhost:9000/cinema-assets/thumbnails/thumb_moana2.jpg',
                'dimensions' => '800x1200'
            ]),
        ];

        $tickets = [
            new DigitalTicket([
                'id' => 'ticket-demo-01',
                'ticketCode' => 'TCK-BOL-8841',
                'showtimeId' => 'show-01',
                'hallName' => 'Sala 1 - MacroXE',
                'movieTitle' => 'Dune: Part Two',
                'seatCode' => 'F12',
                'userId' => 'usr-client-01',
                'userEmail' => 'cliente@test.com',
                'priceCents' => 4500,
                'qrHallKey' => 'eyJ0aWNrZXQiOiJUQ0stQk9MLTg4NDEiLCJleHAiOjE3NjEyOTYwMDB9.SIGNATURE_KEY',
                'qrCandyToken' => 'CANDY-TOKEN-COMBO-DUO-8841',
                'status' => 'ISSUED',
                'candyComboDetails' => [
                    'code' => 'COMBO-DUO-01',
                    'name' => 'Combo Dúo Clásico (2 Pipocas Grandes + 2 Refrescos)',
                    'items' => ['Pipoca Salada Grande x2', 'Coca Cola 32oz x2']
                ],
                'candyRedeemed' => false,
            ]),
            new DigitalTicket([
                'id' => 'ticket-demo-02',
                'ticketCode' => 'TCK-BOL-9923',
                'showtimeId' => 'show-02',
                'hallName' => 'Sala VIP Platinum',
                'movieTitle' => 'Gladiator II',
                'seatCode' => 'B4',
                'userId' => 'usr-client-02',
                'userEmail' => 'vip@test.com',
                'priceCents' => 6000,
                'qrHallKey' => 'eyJ0aWNrZXQiOiJUQ0stQk9MLTk5MjMiLCJleHAiOjE3NjEyOTYwMDB9.SIGNATURE_KEY_VIP',
                'qrCandyToken' => 'CANDY-TOKEN-MEGA-VIP-9923',
                'status' => 'ISSUED',
                'candyComboDetails' => [
                    'code' => 'COMBO-VIP-PLATINUM',
                    'name' => 'Combo VIP Platinum Nachos & Pipoca',
                    'items' => ['Nachos con Queso Cheddar x1', 'Pipoca Mantequilla x1', 'Refresco 32oz x2']
                ],
                'candyRedeemed' => false,
            ])
        ];

        return [
            'assets' => $assets,
            'tickets' => $tickets,
            'users' => [
                'cajero' => 'cajero@test.com',
                'operador' => 'operador@test.com',
                'admin' => 'admin@test.com'
            ]
        ];
    }
}
