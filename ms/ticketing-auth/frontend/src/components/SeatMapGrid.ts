export type SeatStatus = 'AVAILABLE' | 'SELECTED' | 'HELD_OTHER' | 'PURCHASED';

export interface SeatItem {
  code: string;
  row: string;
  column: number;
  status: SeatStatus;
}

export class SeatMapModel {
  static generateHallLayout(rows = ['A', 'B', 'C', 'D', 'E', 'F'], cols = 10): SeatItem[] {
    const seats: SeatItem[] = [];
    for (const r of rows) {
      for (let c = 1; c <= cols; c++) {
        seats.push({
          code: `${r}-${c}`,
          row: r,
          column: c,
          status: 'AVAILABLE',
        });
      }
    }
    return seats;
  }

  static toggleSeat(
    seats: SeatItem[],
    seatCode: string,
    currentSelected: string[],
    maxSeats = 8
  ): { updatedSeats: SeatItem[]; selectedCodes: string[]; error?: string } {
    const target = seats.find((s) => s.code === seatCode);
    if (!target) return { updatedSeats: seats, selectedCodes: currentSelected, error: 'Asiento no encontrado' };

    if (target.status === 'PURCHASED' || target.status === 'HELD_OTHER') {
      return { updatedSeats: seats, selectedCodes: currentSelected, error: 'Este asiento no está disponible' };
    }

    const isAlreadySelected = currentSelected.includes(seatCode);

    if (isAlreadySelected) {
      const nextSelected = currentSelected.filter((c) => c !== seatCode);
      const updated = seats.map((s) => (s.code === seatCode ? { ...s, status: 'AVAILABLE' as SeatStatus } : s));
      return { updatedSeats: updated, selectedCodes: nextSelected };
    } else {
      if (currentSelected.length >= maxSeats) {
        return {
          updatedSeats: seats,
          selectedCodes: currentSelected,
          error: `Máximo permitido: ${maxSeats} asientos por compra`,
        };
      }
      const nextSelected = [...currentSelected, seatCode];
      const updated = seats.map((s) => (s.code === seatCode ? { ...s, status: 'SELECTED' as SeatStatus } : s));
      return { updatedSeats: updated, selectedCodes: nextSelected };
    }
  }
}

export class CircularHoldTimerModel {
  static readonly TOTAL_SECONDS = 60; // RB-02.1

  static calculateProgress(secondsRemaining: number): {
    percentage: number;
    colorTheme: 'green' | 'amber' | 'red_pulse';
    isExpired: boolean;
  } {
    const clamped = Math.max(0, Math.min(this.TOTAL_SECONDS, secondsRemaining));
    const percentage = Math.round((clamped / this.TOTAL_SECONDS) * 100);

    let colorTheme: 'green' | 'amber' | 'red_pulse' = 'green';
    if (clamped <= 15) {
      colorTheme = 'red_pulse';
    } else if (clamped <= 30) {
      colorTheme = 'amber';
    }

    return {
      percentage,
      colorTheme,
      isExpired: clamped === 0,
    };
  }
}
