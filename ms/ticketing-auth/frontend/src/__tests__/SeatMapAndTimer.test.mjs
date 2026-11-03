import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { SeatMapModel, CircularHoldTimerModel } from '../components/SeatMapGrid.ts';

describe('T3.3 [TEST] Seat Map & Circular Hold Timer (60s TTL)', () => {
  test('debe inicializar el plano con filas y columnas disponibles', () => {
    const layout = SeatMapModel.generateHallLayout(['A', 'B'], 5);
    assert.equal(layout.length, 10);
    assert.equal(layout[0].code, 'A-1');
    assert.equal(layout[0].status, 'AVAILABLE');
  });

  test('debe permitir seleccionar y deseleccionar un asiento disponible', () => {
    const layout = SeatMapModel.generateHallLayout(['A'], 3);
    
    // Seleccionar A-1
    const res1 = SeatMapModel.toggleSeat(layout, 'A-1', []);
    assert.deepEqual(res1.selectedCodes, ['A-1']);
    assert.equal(res1.updatedSeats.find(s => s.code === 'A-1')?.status, 'SELECTED');

    // Deseleccionar A-1
    const res2 = SeatMapModel.toggleSeat(res1.updatedSeats, 'A-1', res1.selectedCodes);
    assert.deepEqual(res2.selectedCodes, []);
    assert.equal(res2.updatedSeats.find(s => s.code === 'A-1')?.status, 'AVAILABLE');
  });

  test('debe limitar la selección a un máximo de 8 asientos por compra', () => {
    const layout = SeatMapModel.generateHallLayout(['A'], 10);
    const existing = ['A-1', 'A-2', 'A-3', 'A-4', 'A-5', 'A-6', 'A-7', 'A-8'];
    
    const res = SeatMapModel.toggleSeat(layout, 'A-9', existing, 8);
    assert.ok(res.error);
    assert.match(res.error, /Máximo permitido/);
    assert.equal(res.selectedCodes.length, 8);
  });

  test('RB-02.1: debe calcular estados del temporizador circular (verde, ámbar, rojo pulsante y expirado)', () => {
    // 60s -> 100% verde
    const t60 = CircularHoldTimerModel.calculateProgress(60);
    assert.equal(t60.percentage, 100);
    assert.equal(t60.colorTheme, 'green');
    assert.equal(t60.isExpired, false);

    // 25s -> ámbar
    const t25 = CircularHoldTimerModel.calculateProgress(25);
    assert.equal(t25.colorTheme, 'amber');

    // 10s -> rojo pulsante
    const t10 = CircularHoldTimerModel.calculateProgress(10);
    assert.equal(t10.colorTheme, 'red_pulse');

    // 0s -> expirado
    const t0 = CircularHoldTimerModel.calculateProgress(0);
    assert.equal(t0.percentage, 0);
    assert.equal(t0.isExpired, true);
  });
});
