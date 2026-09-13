import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import { apiErrorMessage } from './api-error';

describe('apiErrorMessage', () => {
  it('usa il messaggio strutturato restituito dal backend', () => {
    const error = new HttpErrorResponse({ status: 400, error: { code: 'INVALID', error: 'Dato non valido' } });
    expect(apiErrorMessage(error)).toBe('Dato non valido');
  });

  it('distingue un servizio non raggiungibile', () => {
    const error = new HttpErrorResponse({ status: 0, error: new ProgressEvent('error') });
    expect(apiErrorMessage(error)).toContain('non è raggiungibile');
  });

  it('rispetta il fallback del flusso', () => {
    expect(apiErrorMessage(new Error('boom'), 'Messaggio contestuale')).toBe('Messaggio contestuale');
  });
});
