import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../errors/CustomError';

const allowedRole = (role: 'HELPER' | 'USER') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.role !== role) {
      throw new BadRequestError({
        code: 403,
        message: 'unauthorized'
      });
    }
    next();
  };
};

export default allowedRole;
