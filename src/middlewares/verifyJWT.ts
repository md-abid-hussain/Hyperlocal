import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../errors/CustomError';
import { ITokenPayload } from '../controllers/authController';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;

const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new BadRequestError({
      code: 401,
      message: 'Unauthorized access',
    });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      throw new BadRequestError({
        code: 403,
        message: 'forbidden',
      });
    }
    const { id, role } = decoded as ITokenPayload;
    res.locals.id = id;
    res.locals.role = role;
    next();
  });
};

export default verifyJWT;
