import { RequestHandler } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Errors } from '../utils/errors';

type DtoClass<T extends object> = new () => T;

function messages(errors: ValidationError[], parent = ''): string[] {
  return errors.flatMap((error) => {
    const field = parent ? `${parent}.${error.property}` : error.property;
    const own = Object.values(error.constraints ?? {}).map((message) => `${field}: ${message}`);
    return [...own, ...messages(error.children ?? [], field)];
  });
}

export function validateBody<T extends object>(Dto: DtoClass<T>): RequestHandler {
  return async (req, _res, next) => {
    try {
      const body = plainToInstance(Dto, req.body ?? {});
      const errors = await validate(body, {
        whitelist: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: false,
      });
      if (errors.length) {
        const details = messages(errors).join('; ');
        next(Errors.badRequest(details || 'Body della richiesta non valido', 'VALIDATION_ERROR'));
        return;
      }
      req.body = body;
      next();
    } catch (error) {
      next(error);
    }
  };
}
