/**
 * Funzioni pure di validazione del dominio. Tenute prive di dipendenze
 * da Express/TypeORM per essere facilmente testate a unita.
 */

export interface TimeSlot {
  startTime: string | Date;
  endTime: string | Date;
}

/** Restituisce true se due slot temporali si sovrappongono (estremi esclusi). */
export function slotsOverlap(a: TimeSlot, b: TimeSlot): boolean {
  const aStart = new Date(a.startTime).getTime();
  const aEnd = new Date(a.endTime).getTime();
  const bStart = new Date(b.startTime).getTime();
  const bEnd = new Date(b.endTime).getTime();
  return aStart < bEnd && bStart < aEnd;
}

/** Valida che startTime preceda endTime e che entrambi siano date valide. */
export function isValidSlot(startTime: string | Date, endTime: string | Date): boolean {
  const s = new Date(startTime);
  const e = new Date(endTime);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return false;
  return s < e;
}

/** Verifica che un appuntamento non collida con gli appuntamenti esistenti del medico. */
export function hasConflict(
  candidate: TimeSlot,
  existing: TimeSlot[],
): boolean {
  return existing.some((slot) => slotsOverlap(candidate, slot));
}

/** Durata in minuti tra due date. */
export function durationMinutes(startTime: string | Date, endTime: string | Date): number {
  const s = new Date(startTime).getTime();
  const e = new Date(endTime).getTime();
  return Math.round((e - s) / 60000);
}
