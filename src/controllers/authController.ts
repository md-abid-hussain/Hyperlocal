import { Request, Response } from 'express';
import { BadRequestError } from '../errors/CustomError';
import { Schema } from 'mongoose';
import Helper from '../models/Helper';
import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export interface ITokenPayload {
  id: Schema.Types.ObjectId;
  username: string;
  role: 'HELPER' | 'USER';
}

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;

// @desc Login
// @route POST /auth
// @access Public
const login = async (req: Request, res: Response) => {
  const { username, password, isHelper } = req.body;
  if (!username || !password) {
    throw new BadRequestError({
      code: 400,
      message: 'Username or email and password are required',
    });
  }

  let existingUser;

  if (isHelper) {
    existingUser = await Helper.findOne({
      $or: [{ username }, { email: username }],
    }).select('+password');
  } else {
    existingUser = await User.findOne({
      $or: [{ username }, { email: username }],
    }).select('+password');
  }

  if (!existingUser) {
    throw new BadRequestError({
      code: 400,
      message: 'Invalid credentials',
      context: { username },
    });
  }

  const matchedPassword = await bcrypt.compare(password, existingUser.password);

  if (!matchedPassword) {
    throw new BadRequestError({
      code: 400,
      message: 'Invalid credentials',
    });
  }

  const accessToken = jwt.sign(
    {
      username: existingUser.username,
      id: existingUser._id,
      role: isHelper ? 'HELPER' : 'USER',
    },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: '15m',
    },
  );

  const refreshToken = jwt.sign(
    {
      username: existingUser.username,
      id: existingUser._id,
      role: isHelper ? 'HELPER' : 'USER',
    },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: '7d',
    },
  );

  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    accessToken,
  });
};

// @desc Refresh
// @route GET /auth/refresh
// @access Public
const refresh = async (req: Request, res: Response) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    throw new BadRequestError({
      code: 401,
      message: 'unauthorized',
    });
  }

  const refreshToken = cookies.jwt;
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as ITokenPayload;

    if (decoded.role !== 'USER' && decoded.role !== 'HELPER') {
      throw new BadRequestError({
        code: 401,
        message: 'unauthorized',
      });
    }
    let existingUser;
    const role = decoded.role;

    if (role === 'USER') {
      existingUser = await User.findById(decoded.id);
    } else {
      existingUser = await Helper.findById(decoded.id);
    }

    if (!existingUser) {
      throw new BadRequestError({
        code: 401,
        message: 'unauthorized',
      });
    }

    const accessToken = jwt.sign({ username: existingUser.username, id: existingUser._id, role }, ACCESS_TOKEN_SECRET, {
      expiresIn: '15m',
    });

    return res.json({ accessToken });
  } catch (syntaxError) {
    throw new BadRequestError({
      code: 401,
      message: 'unauthorized',
    });
  }
};

// @desc Logout
// @route POST /auth/logout
// @access Public
const logout = async (req: Request, res: Response) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return res.sendStatus(204);
  }

  res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'none' });

  return res.json({ message: 'Log out successfully' });
};

export default { login, refresh, logout };
