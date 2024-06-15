import { type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { BadRequestError } from '../errors/CustomError';
import { isValidObjectId } from 'mongoose';

// @desc GET ALL USERS
// @route GET /users
// @access Public
const getAllUser = async (req: Request, res: Response) => {
  const users = await User.find();
  return res.json({ users });
};

// @desc CREATE USER
// @route POST /users
// @access Public
const createUser = async (req: Request, res: Response) => {
  const { name, email, username, password, latitude, longitude } = req.body;

  if (!name || !email || !username || !password) {
    throw new BadRequestError({
      code: 400,
      message: 'All fields are required',
      context: { fields: ['name', 'email', 'username', 'password'] },
    });
  }

  const userExists = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (userExists !== null) {
    throw new BadRequestError({
      code: 409,
      message: 'User already exists',
      context: { email, username },
    });
  }

  const newUser = await User.create({
    name,
    email,
    username,
    password: await bcrypt.hash(password, 10),
  });

  if (latitude && longitude) {
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new BadRequestError({
        code: 400,
        message: 'Invalid coordinates',
        context: { latitude, longitude },
      });
    }

    newUser.location = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };

    await newUser.save();
  }

  return res.json({
    user: newUser,
  });
};

// @desc UPDATE USER
// @route PATCH /users
// @access Private
const updateUser = async (req: Request, res: Response) => {
  const { name, email, username, latitude, longitude, newPassword, oldPassword } = req.body;
  const userId = res.locals.id;
  if (!userId || !isValidObjectId(userId)) {
    throw new BadRequestError({
      code: 400,
      message: 'User ID is required',
      context: { fields: ['userId'] },
    });
  }

  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new BadRequestError({
      code: 400,
      message: 'User not found',
      context: { userId },
    });
  }

  if (name) {
    user.name = name;
  }

  if (email) {
    user.email = email;
  }

  if (username) {
    user.username = username;
  }

  if (latitude && longitude) {
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new BadRequestError({
        code: 400,
        message: 'Invalid coordinates',
        context: { latitude, longitude },
      });
    }

    user.location = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };
  }

  if (newPassword && oldPassword) {
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      throw new BadRequestError({
        code: 400,
        message: 'Invalid password',
        context: { oldPassword },
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
  }

  await user.save();

  return res.json({ user });
};

// @desc DELETE USER
// @route DELETE /users
// @access Private
const deleteUser = async (req: Request, res: Response) => {
  const userId = res.locals.id;

  if (!userId || !isValidObjectId(userId)) {
    throw new BadRequestError({
      code: 400,
      message: 'User ID is required',
      context: { fields: ['userId'] },
    });
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new BadRequestError({
      code: 400,
      message: 'User not found',
      context: { userId },
    });
  }

  await user.deleteAccount();

  res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'none' });

  return res.json({ message: 'User deleted' });
};

// @desc GET CURRENT USER
// @route GET /users/me
// @access Private
const getCurrentUser = async (req: Request, res: Response) => {
  const userId = res.locals.id;

  const user = await User.findById(userId);

  if (!user) {
    throw new BadRequestError({
      code: 400,
      message: 'User not found',
      context: { userId },
    });
  }

  return res.json({ user });
};
export default { getAllUser, createUser, updateUser, deleteUser, getCurrentUser };
