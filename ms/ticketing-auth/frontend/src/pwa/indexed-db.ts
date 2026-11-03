import { DigitalTicketWalletItem } from '../views/OfflineTicketWallet.js';

export class IndexedDbTicketStore {
  private static readonly DB_NAME = 'CineCenterTicketWalletDB';
  private static readonly STORE_NAME = 'tickets';

  static async saveTicketsLocally(tickets: DigitalTicketWalletItem[]): Promise<boolean> {
    // Almacena en memoria/localStorage/IndexedDB
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.STORE_NAME, JSON.stringify(tickets));
      }
      return true;
    } catch {
      return false;
    }
  }

  static async getStoredTickets(): Promise<DigitalTicketWalletItem[]> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = window.localStorage.getItem(this.STORE_NAME);
        if (data) return JSON.parse(data);
      }
    } catch {}
    return [];
  }
}
