import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

export const APP_TIME_ZONE = 'Europe/Rome';

export function isValidCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const instant = fromZonedTime(`${value}T12:00:00`, APP_TIME_ZONE);
  return !Number.isNaN(instant.getTime()) && formatInTimeZone(instant, APP_TIME_ZONE, 'yyyy-MM-dd') === value;
}

export function zonedDateTimeToUtc(date: string, time: string): Date | null {
  if (!isValidCalendarDate(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const instant = fromZonedTime(`${date}T${time}:00`, APP_TIME_ZONE);
  const roundTrip = formatInTimeZone(instant, APP_TIME_ZONE, 'yyyy-MM-dd HH:mm');
  return roundTrip === `${date} ${time}` ? instant : null;
}

export function dateInAppTimeZone(value: Date): string {
  return formatInTimeZone(value, APP_TIME_ZONE, 'yyyy-MM-dd');
}

export function todayInAppTimeZone(): string {
  return dateInAppTimeZone(new Date());
}

export function isAbsoluteIsoDateTime(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value);
}
