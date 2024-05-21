import { logEvents } from './logEvent';
import { type Request, type Response, type NextFunction } from 'express';
import { CustomError } from '../errors/CustomError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  logEvents(`${err.name}\t${err.message}`, 'errorLog.txt');
  if (err instanceof CustomError) {
    const { statusCode, errors, logging } = err;
    if (logging) {
      console.error(
        JSON.stringify(
          {
            code: statusCode,
            errors,
            // stack: err.stack,
          },
          null,
          2,
        ),
      );
    }

    return res.status(statusCode).json({ message: err.message, error: true, context: errors[0].context });
  }
  console.error(err);
  return res.status(500).json({ message: err.name, context: err.message, error: true });
};
