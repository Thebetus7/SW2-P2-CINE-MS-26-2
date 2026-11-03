import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { OfflineTicketWalletModel } from '../views/OfflineTicketWallet.ts';

describe('T5.3 [TEST] Digital Ticket Wallet & In-App Dual QR', () => {
  test('debe listar boletos de la billetera con su información de función', () => {
    const tickets = OfflineTicketWalletModel.getSampleWallet();
    assert.equal(tickets.length, 2);
    assert.equal(tickets[0].ticketCode, 'TCK-BOL-5501');
    assert.equal(tickets[0].seatCode, 'D-4');
    assert.equal(tickets[0].status, 'ISSUED');
  });

  test('INV-BIZ-03: debe proyectar ambos códigos QR en pantalla sin forzar descargas a disco', () => {
    const tickets = OfflineTicketWalletModel.getSampleWallet();
    const ticketWithCandy = tickets[0];

    const displayData = OfflineTicketWalletModel.getModalDisplayData(ticketWithCandy);
    
    // QR Llave presente
    assert.equal(displayData.hasHallAccessQr, true);
    assert.ok(displayData.hallQrData.startsWith('eyJhbGciOiJIUzI1NiJ9'));

    // QR Confitería presente
    assert.equal(displayData.hasCandyVoucherQr, true);
    assert.equal(displayData.candyQrData, 'CANDY-9988-VOUCHER');

    // Invariante de negocio: NO requiere descargas de archivos PDF o imágenes
    assert.equal(displayData.isDownloadRequired, false);
  });

  test('boleto sin combo solo proyecta QR Llave', () => {
    const tickets = OfflineTicketWalletModel.getSampleWallet();
    const ticketWithoutCandy = tickets[1];

    const displayData = OfflineTicketWalletModel.getModalDisplayData(ticketWithoutCandy);
    assert.equal(displayData.hasHallAccessQr, true);
    assert.equal(displayData.hasCandyVoucherQr, false);
    assert.equal(displayData.candyQrData, null);
  });
});
