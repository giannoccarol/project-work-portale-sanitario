import { APP_TIME_ZONE, dateInAppTimeZone, isAbsoluteIsoDateTime, isValidCalendarDate, zonedDateTimeToUtc } from './time';
import { formatInTimeZone } from 'date-fns-tz';

describe('Europe/Rome time strategy', () => {
  test('rejects impossible calendar dates and timezone-less timestamps', () => {
    expect(isValidCalendarDate('2026-02-29')).toBe(false);
    expect(isValidCalendarDate('2026-08-23')).toBe(true);
    expect(isAbsoluteIsoDateTime('2026-08-23T09:00:00')).toBe(false);
    expect(isAbsoluteIsoDateTime('2026-08-23T09:00:00+02:00')).toBe(true);
  });

  test('keeps Rome wall time stable across daylight-saving changes', () => {
    const winter = zonedDateTimeToUtc('2026-01-15', '09:00');
    const summer = zonedDateTimeToUtc('2026-07-15', '09:00');
    expect(winter?.toISOString()).toBe('2026-01-15T08:00:00.000Z');
    expect(summer?.toISOString()).toBe('2026-07-15T07:00:00.000Z');
    expect(formatInTimeZone(winter!, APP_TIME_ZONE, 'HH:mm')).toBe('09:00');
    expect(formatInTimeZone(summer!, APP_TIME_ZONE, 'HH:mm')).toBe('09:00');
  });

  test('formats instants using Europe/Rome rather than the process timezone', () => {
    expect(dateInAppTimeZone(new Date('2026-08-22T22:30:00.000Z'))).toBe('2026-08-23');
  });
});
