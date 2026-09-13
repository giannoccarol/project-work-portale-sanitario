import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { JwtPayload } from '../utils/auth';
import { AppDataSource } from '../config/data-source';
import { Doctor } from '../entities/Doctor';

export interface AuthUser extends JwtPayload {}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ code: 'AUTH_TOKEN_MISSING', error: 'Token mancante o non valido' });
    return;
  }
  const token = header.slice('Bearer '.length).trim();
  let payload: JwtPayload;
  try {
    payload = verifyToken(token);
  } catch {
    res.status(401).json({ code: 'AUTH_TOKEN_INVALID', error: 'Token non valido o scaduto' });
    return;
  }
  try {
    if (payload.role === 'doctor') {
      const doctor = await AppDataSource.getRepository(Doctor).findOne({
        where: { user: { id: payload.sub }, isActive: true },
      });
      if (!doctor) {
        res.status(403).json({ code: 'DOCTOR_ARCHIVED', error: 'Account medico archiviato' });
        return;
      }
    }
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ code: 'AUTH_UNAUTHORIZED', error: 'Non autenticato' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ code: 'AUTH_FORBIDDEN', error: 'Accesso negato: ruolo non autorizzato' });
      return;
    }
    next();
  };
}
