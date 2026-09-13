export class AppError extends Error {
  status: number;
  code: string;

  constructor(status: number, message: string, code: string) {
    super(message);
    this.status = status;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const Errors = {
  badRequest: (m = 'Richiesta non valida', code = 'VALIDATION_ERROR') => new AppError(400, m, code),
  unauthorized: (m = 'Non autenticato', code = 'AUTH_UNAUTHORIZED') => new AppError(401, m, code),
  forbidden: (m = 'Accesso negato', code = 'AUTH_FORBIDDEN') => new AppError(403, m, code),
  notFound: (m = 'Risorsa non trovata', code = 'NOT_FOUND') => new AppError(404, m, code),
  conflict: (m = 'Conflitto di risorsa', code = 'CONFLICT') => new AppError(409, m, code),
};
