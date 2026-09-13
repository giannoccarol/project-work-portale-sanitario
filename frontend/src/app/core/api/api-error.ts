import { HttpErrorResponse } from '@angular/common/http';

export function apiErrorMessage(error: unknown, fallback = 'Operazione non riuscita. Riprova tra poco.'): string {
  if (error instanceof HttpErrorResponse) {
    const message = error.error?.error;
    if (typeof message === 'string' && message.trim()) return message;
    if (error.status === 0) return 'Il servizio non è raggiungibile. Verifica che il backend sia avviato.';
  }
  return fallback;
}
