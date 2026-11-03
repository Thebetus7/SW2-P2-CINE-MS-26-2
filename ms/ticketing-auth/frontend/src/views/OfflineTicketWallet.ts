export interface DigitalTicketWalletItem {
  id: string;
  ticketCode: string;
  movieTitle: string;
  showtime: string;
  hallName: string;
  seatCode: string;
  qrHallKey: string;
  qrCandyToken?: string;
  candyComboName?: string;
  status: 'ISSUED' | 'USED' | 'CANCELLED';
}

export class OfflineTicketWalletModel {
  static getSampleWallet(): DigitalTicketWalletItem[] {
    return [
      {
        id: 'tck-wallet-01',
        ticketCode: 'TCK-BOL-5501',
        movieTitle: 'Dune: Part Two (IMAX 3D)',
        showtime: '2026-10-25 19:30',
        hallName: 'Sala 1 - IMAX',
        seatCode: 'D-4',
        qrHallKey: 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWNrZXQiOiJUQ0stQk9MLTU1MDEifQ.sig_offline_valid',
        qrCandyToken: 'CANDY-9988-VOUCHER',
        candyComboName: 'Combo Dúo Clásico (2 Pipocas + 2 Gaseosas)',
        status: 'ISSUED',
      },
      {
        id: 'tck-wallet-02',
        ticketCode: 'TCK-BOL-5502',
        movieTitle: 'Dune: Part Two (IMAX 3D)',
        showtime: '2026-10-25 19:30',
        hallName: 'Sala 1 - IMAX',
        seatCode: 'D-5',
        qrHallKey: 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWNrZXQiOiJUQ0stQk9MLTU1MDIifQ.sig_offline_valid',
        status: 'ISSUED',
      },
    ];
  }

  /**
   * INV-BIZ-03: Renderiza ambos códigos QR en pantalla para su lectura óptica sin descargas a disco.
   */
  static getModalDisplayData(ticket: DigitalTicketWalletItem): {
    hasHallAccessQr: boolean;
    hasCandyVoucherQr: boolean;
    hallQrData: string;
    candyQrData: string | null;
    isDownloadRequired: boolean;
  } {
    return {
      hasHallAccessQr: Boolean(ticket.qrHallKey),
      hasCandyVoucherQr: Boolean(ticket.qrCandyToken),
      hallQrData: ticket.qrHallKey,
      candyQrData: ticket.qrCandyToken ?? null,
      isDownloadRequired: false, // Invariante: In-App viewing only
    };
  }
}
