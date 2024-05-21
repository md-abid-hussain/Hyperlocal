import { Request, Response } from 'express';
import Helper from '../models/Helper';
import bcrypt from 'bcrypt';
import { isValidObjectId } from 'mongoose';
import { BadRequestError } from '../errors/CustomError';

// @desc GET ALL HELPERS
// @route GET /helper
// @access Public
const getAllHelper = async (req: Request, res: Response) => {
  const helpers = await Helper.find();
  return res.json({ helpers });
};

// @desc CREATE HELPER
// @route POST /helper
// @access Public
const createHelper = async (req: Request, res: Response) => {
  const { name, email, username, password, latitude, longitude } = req.body;

  if (!name || !email || !username || !password) {
    throw new BadRequestError({
      code: 400,
      message: 'All fields are required',
      context: { fields: ['name', 'email', 'username', 'password'] },
    });
  }

  const helperExist = await Helper.findOne({
    $or: [{ email }, { username }],
  });

  if (helperExist !== null) {
    throw new BadRequestError({
      code: 409,
      message: 'User already exists',
      context: { email, username },
    });
  }

  const newHelper = await Helper.create({
    name,
    email,
    username,
    password: bcrypt.hashSync(password, 10),
  });

  if (latitude && longitude) {
    if ((latitude < -90 || latitude > 90) && (longitude < -180 || longitude > 180)) {
      throw new BadRequestError({
        code: 400,
        message: 'Invalid coordinates',
        context: { latitude, longitude },
      });
    }

    newHelper.location = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };
    await newHelper.save();
  }

  return res.json({
    helper: newHelper,
  });
};

// @desc UPDATE HELPER
// @route PATCH /helper
// @access Private
const updateHelper = async (req: Request, res: Response) => {
  const { name, email, username, latitude, longitude } = req.body;
  const helperId = res.locals.id

  if (!helperId || !isValidObjectId(helperId)) {
    throw new BadRequestError({
      code: 400,
      message: 'Helper ID is required',
      context: { fields: ['helperId'] },
    });
  }

  const helper = await Helper.findById(helperId);

  if (!helper) {
    throw new BadRequestError({
      code: 400,
      message: 'Helper not found',
      context: { helperId },
    });
  }

  if (name) {
    helper.name = name;
  }

  if (email) {
    helper.email = email;
  }

  if (username) {
    helper.username = username;
  }

  if (latitude && longitude) {
    if ((latitude < -90 || latitude > 90) && (longitude < -180 || longitude > 180)) {
      throw new BadRequestError({
        code: 400,
        message: 'Invalid coordinates',
        context: { latitude, longitude },
      });
    }

    helper.location = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };
  }

  await helper.save();

  return res.json({ helper });
};

// @desc DELETE HELPER
// @route DELETE /helper
// @access Private
const deleteHelper = async (req: Request, res: Response) => {
  const helperId = res.locals.id

  if (!helperId || !isValidObjectId(helperId)) {
    throw new BadRequestError({
      code: 400,
      message: 'Helper ID is required',
      context: { fields: ['helperId'] },
    });
  }

  const helper = await Helper.findById(helperId);

  if (!helper) {
    throw new BadRequestError({
      code: 400,
      message: 'Helper not found',
      context: { helperId },
    });
  }

  await helper.deleteOne();

  return res.json({ message: 'Helper deleted' });
};

export default { getAllHelper, createHelper, updateHelper, deleteHelper };
