import { hashPassword, verifyPassword, generateToken, verifyToken } from './auth';

describe('auth utils', () => {
  it('hashPassword produce un hash diverso dalla password in chiaro', async () => {
    const hash = await hashPassword('segreto123');
    expect(hash).not.toBe('segreto123');
  });

  it('verifyPassword conferma la corrispondenza', async () => {
    const hash = await hashPassword('segreto123');
    expect(await verifyPassword('segreto123', hash)).toBe(true);
    expect(await verifyPassword('errata', hash)).toBe(false);
  });

  it('generateToken/verifyToken round-trip', () => {
    const payload = { sub: 'abc', email: 'a@b.it', role: 'patient' };
    const token = generateToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.sub).toBe('abc');
    expect(decoded.email).toBe('a@b.it');
    expect(decoded.role).toBe('patient');
  });

  it('verifyToken lancia su token invalido', () => {
    expect(() => verifyToken('token.falso')).toThrow();
  });
});
