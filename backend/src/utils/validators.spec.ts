import { slotsOverlap, isValidSlot, hasConflict, durationMinutes } from './validators';

describe('validators', () => {
  it('slotsOverlap rileva sovrapposizioni', () => {
    const a = { startTime: '2026-07-20T10:00:00', endTime: '2026-07-20T10:30:00' };
    const b = { startTime: '2026-07-20T10:15:00', endTime: '2026-07-20T11:00:00' };
    const c = { startTime: '2026-07-20T10:30:00', endTime: '2026-07-20T11:00:00' };
    expect(slotsOverlap(a, b)).toBe(true);
    expect(slotsOverlap(a, c)).toBe(false); // estremi esclusi
  });

  it('isValidSlot richiede startTime < endTime', () => {
    expect(isValidSlot('2026-07-20T10:00:00', '2026-07-20T10:30:00')).toBe(true);
    expect(isValidSlot('2026-07-20T10:30:00', '2026-07-20T10:00:00')).toBe(false);
    expect(isValidSlot('nonunaData', '2026-07-20T10:00:00')).toBe(false);
  });

  it('hasConflict individua conflitti in una lista', () => {
    const existing = [{ startTime: '2026-07-20T10:00:00', endTime: '2026-07-20T10:30:00' }];
    expect(hasConflict({ startTime: '2026-07-20T10:15:00', endTime: '2026-07-20T10:45:00' }, existing)).toBe(true);
    expect(hasConflict({ startTime: '2026-07-20T11:00:00', endTime: '2026-07-20T11:30:00' }, existing)).toBe(false);
  });

  it('durationMinutes calcola i minuti', () => {
    expect(durationMinutes('2026-07-20T10:00:00', '2026-07-20T10:30:00')).toBe(30);
    expect(durationMinutes('2026-07-20T10:00:00', '2026-07-20T11:00:00')).toBe(60);
  });
});
