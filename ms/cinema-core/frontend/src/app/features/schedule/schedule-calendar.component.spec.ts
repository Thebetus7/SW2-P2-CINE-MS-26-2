import { ScheduleCalendarComponent } from './schedule-calendar.component';

describe('ScheduleCalendarComponent & 20-min Buffer Conflict Check (T5.2 / T5.3)', () => {
  let calendar: ScheduleCalendarComponent;

  beforeEach(() => {
    calendar = new ScheduleCalendarComponent();
  });

  it('debe calcular la hora de fin y la hora disponible con buffer de 20 min', () => {
    // Función de Dune 2 en Sala 1: 14:00 a 16:46 (166 min)
    const show = calendar.showtimes.find(s => s.id === 'show-01')!;
    expect(show).toBeDefined();

    const endTime = calendar.getEndTime(show);
    // 14:00 + 166 min = 16:46
    expect(endTime.toISOString()).toContain('16:46:00');

    const availableTime = calendar.getAvailableAfterBuffer(show);
    // 16:46 + 20 min = 17:06
    expect(availableTime.toISOString()).toContain('17:06:00');
  });

  it('RB-01.1: debe bloquear con mensaje de advertencia solapamiento directo durante proyección', () => {
    // Intento de programar a las 15:00 en Sala 1 (Dune 2 se proyecta hasta las 16:46)
    const collision = calendar.checkCollision(
      'hall-c1-01',
      new Date('2026-10-20T15:00:00Z'),
      120
    );

    expect(collision.hasCollision).toBe(true);
    expect(collision.conflictDetails).toContain('SOLAPAMIENTO BLOQUEADO');
    expect(collision.conflictDetails).toContain('Dune: Part Two');
  });

  it('INV-BIZ-01: debe bloquear si intenta iniciar dentro del buffer de limpieza de 20 min', () => {
    // Dune 2 termina a las 16:46. El buffer dura hasta las 17:06.
    // Intento a las 16:55 (9 min después de que acabó la película, pero en pleno buffer de limpieza)
    const collision = calendar.checkCollision(
      'hall-c1-01',
      new Date('2026-10-20T16:55:00Z'),
      90
    );

    expect(collision.hasCollision).toBe(true);
    expect(collision.conflictDetails).toContain('buffer obligatorio de limpieza');
  });

  it('debe permitir programar exitosamente cuando se respeta el buffer de 20 minutos', () => {
    // Programar función a las 17:06:00 (exactamente al expirar el buffer de Dune 2)
    const wasScheduled = calendar.scheduleNewShowtime({
      hallId: 'hall-c1-01',
      hallName: 'Sala 1 - MacroXE',
      movieId: 'mov-interstellar',
      movieTitle: 'Interstellar',
      startTime: new Date('2026-10-20T17:06:00Z'),
      durationMinutes: 150, // Terminará a las 19:36, pero Gladiator empieza a las 17:30 así que chocaría con Gladiator.
      priceBs: 40,
    });

    // Como 17:06 choca con Gladiator II que está a las 17:30, scheduleNewShowtime debe retornar false
    expect(wasScheduled).toBe(false);

    // Ahora intentemos después de Gladiator II: 20:30 UTC
    const success = calendar.scheduleNewShowtime({
      hallId: 'hall-c1-01',
      hallName: 'Sala 1 - MacroXE',
      movieId: 'mov-interstellar',
      movieTitle: 'Interstellar Night Show',
      startTime: new Date('2026-10-20T20:30:00Z'),
      durationMinutes: 150,
      priceBs: 45,
    });

    expect(success).toBe(true);
    expect(calendar.successMessage).toContain('Interstellar Night Show');
    expect(calendar.lastConflictMessage).toBe('');
  });
});
