import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { WelcomeBillboardModel } from '../views/WelcomeBillboardView.ts';
import { LoginViewModel } from '../views/LoginView.ts';

describe('T2.3 [TEST] Welcome Billboard & Smart Role Routing', () => {
  test('debe listar películas de cartelera con formatos IMAX y showtimes', () => {
    const movies = WelcomeBillboardModel.getSampleMovies();
    assert.equal(movies.length >= 2, true);
    
    const dune = movies.find(m => m.title.includes('Dune'));
    assert.ok(dune);
    assert.equal(dune.format, 'IMAX 3D');
    assert.equal(dune.showtimes.length >= 2, true);
  });

  test('debe reportar semáforo de conexión UP para todos los microservicios', () => {
    const health = WelcomeBillboardModel.getSystemHealth();
    assert.equal(health.cinemaCore, 'UP');
    assert.equal(health.mediaHub, 'UP');
    assert.equal(health.ticketingAuth, 'UP');
    assert.equal(health.aiMcp, 'UP');
  });

  test('INV-BIZ-05: debe bifurcar administradores hacia Angular ERP en puerto 4200', () => {
    const session = LoginViewModel.authenticate('admin.cine@cinecenter.com', 'Password123!');
    assert.equal(session.role, 'ROLE_ADMIN');
    assert.equal(session.redirectUrl, 'http://localhost:4200/admin');
  });

  test('INV-BIZ-05: debe bifurcar cajeros hacia terminal POS en puerto 8080', () => {
    const session = LoginViewModel.authenticate('cajero01@cinecenter.com', 'Password123!');
    assert.equal(session.role, 'ROLE_CASHIER');
    assert.equal(session.redirectUrl, 'http://localhost:8080/pos/candy-scan');
  });

  test('INV-BIZ-05: debe dirigir clientes a cartelera autenticada en /cartelera', () => {
    const session = LoginViewModel.authenticate('cliente.frecuente@gmail.com', 'Password123!');
    assert.equal(session.role, 'ROLE_CLIENT');
    assert.equal(session.redirectUrl, '/cartelera');
  });
});
