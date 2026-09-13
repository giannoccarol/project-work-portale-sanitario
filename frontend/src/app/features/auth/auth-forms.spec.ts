import { FormControl, Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';

describe('regole dei moduli di autenticazione', () => {
  it('richiede una email valida', () => {
    const email = new FormControl('', [Validators.required, Validators.email]);
    expect(email.valid).toBe(false);
    email.setValue('paziente@example.it');
    expect(email.valid).toBe(true);
  });

  it('richiede almeno otto caratteri per la password', () => {
    const password = new FormControl('', [Validators.required, Validators.minLength(8)]);
    password.setValue('corta');
    expect(password.hasError('minlength')).toBe(true);
    password.setValue('Password1!');
    expect(password.valid).toBe(true);
  });

  it('valida il formato del codice fiscale usato dal backend', () => {
    const fiscalCode = new FormControl('', Validators.pattern(/^[A-Za-z0-9]{16}$/));
    fiscalCode.setValue('RSSMRA80A01H501U');
    expect(fiscalCode.valid).toBe(true);
  });
});
