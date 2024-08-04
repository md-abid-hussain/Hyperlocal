import { Response, Request } from 'express';
import { BadRequestError } from '../errors/CustomError';
import { isValidObjectId } from 'mongoose';
import Task from '../models/Task';
import Category from '../models/Category';
import Helper from '../models/Helper';

// @desc GET ALL TASKS
// @route GET /tasks
// @access Private
const getAllTask = async (req: Request, res: Response) => {
  if (res.locals.role === 'HELPER') {
    const tasks = await Task.find().populate('owner', 'name email').populate('category', 'name');
    return res.json({ tasks: tasks });
  }
  const userTask = await Task.find({ owner: res.locals.id })
    .populate('owner', 'name email')
    .populate('category', 'name');
  return res.json({ tasks: userTask });
};

// @desc CREATE TASK
// @route POST /tasks
// @access Private
const createTask = async (req: Request, res: Response) => {
  const { title, description, category, latitude, longitude, specialInstructions, budget } = req.body;
  const owner = res.locals.id;

  if (!title || !description || !category || !owner || !latitude || !longitude) {
    throw new BadRequestError({
      code: 400,
      message: 'All fields are required',
      context: { fields: ['title', 'description', 'category', 'latitude', 'longitude'] },
    });
  }

  if (!isValidObjectId(category)) {
    throw new BadRequestError({
      code: 400,
      message: 'Invalid category Id',
      context: { category },
    });
  }

  if (!isValidObjectId(owner)) {
    throw new BadRequestError({
      code: 400,
      message: 'Invalid owner Id',
      context: { owner },
    });
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new BadRequestError({
      code: 400,
      message: 'Invalid coordinates',
      context: { latitude, longitude },
    });
  }

  if (budget && (isNaN(Number(budget)) || budget < 0)) {
    throw new BadRequestError({
      code: 400,
      message: 'Invalid budget value',
      context: { budget },
    });
  }

  const newTask = await Task.create({
    title,
    description,
    category: category,
    location: {
      type: 'Point',
      coordinates: [latitude, longitude],
    },
    owner,
    budget: budget || 0,
  });

  if (specialInstructions && Array.isArray(specialInstructions) && specialInstructions.length > 0) {
    newTask.specialInstructions = specialInstructions;
    await newTask.save();
  }

  return res.json({ task: newTask });
};

// @desc UPDATE TASK
// @route PATCH /tasks
// @access Private
const updateTask = async (req: Request, res: Response) => {
  const { taskId, title, description, category, budget, latitude, longitude, status, specialInstructions } = req.body;
  const owner = res.locals.id;

  if (!taskId) {
    throw new BadRequestError({
      code: 400,
      message: 'Task Id is required',
      context: { fields: ['taskId'] },
    });
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new BadRequestError({
      code: 404,
      message: 'Task not found',
      context: { taskId },
    });
  }

  if (task.owner.toString() !== owner) {
    throw new BadRequestError({
      code: 403,
      message: 'Forbidden',
    });
  }

  if (budget && (isNaN(Number(budget)) || budget < 0)) {
    throw new BadRequestError({
      code: 400,
      message: 'Invalid budget value',
      context: { budget },
    });
  }

  if (title) {
    task.title = title;
  }

  if (description) {
    task.description = description;
  }

  if (category) {
    task.category = category;
  }

  if (budget) {
    task.budget = budget;
  }

  if (latitude && longitude) {
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new BadRequestError({
        code: 400,
        message: 'Invalid coordinates',
        context: { latitude, longitude },
      });
    }

    task.location = {
      type: 'Point',
      coordinates: [latitude, longitude],
    };
  }

  if (status) {
    if (status === 'NEW' || status === 'IN_PROGRESS' || status === 'DONE') {
      task.status = status;
    } else {
      throw new BadRequestError({
        code: 400,
        message: 'Invalid status',
        context: { status },
      });
    }
  }

  if (specialInstructions && Array.isArray(specialInstructions) && specialInstructions.length > 0) {
    task.specialInstructions = specialInstructions;
  }

  await task.save();

  return res.json({ task });
};

// @desc DELETE TASK
// @route DELETE /tasks
// @access Private
const deleteTask = async (req: Request, res: Response) => {
  const { taskId } = req.body;

  const owner = res.locals.id;

  if (!taskId) {
    throw new BadRequestError({
      code: 400,
      message: 'Task Id is required',
      context: { fields: ['taskId'] },
    });
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new BadRequestError({
      code: 404,
      message: 'Task not found',
      context: { taskId },
    });
  }

  if (task.owner.toString() !== owner) {
    throw new BadRequestError({
      code: 403,
      message: 'Forbidden',
    });
  }

  await task.deleteTask();

  return res.json({ message: 'Task deleted successfully' });
};

// @desc APPLY FOR TASK
// @route PATCH /tasks/apply
// @access Private
const applyForTask = async (req: Request, res: Response) => {
  const { taskId } = req.body;
  const helperId = res.locals.id;

  if (!taskId || !helperId || !isValidObjectId(taskId) || !isValidObjectId(helperId)) {
    throw new BadRequestError({
      code: 400,
      message: 'Task Id and Helper Id are required',
      context: { fields: ['taskId', 'helperId'] },
    });
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new BadRequestError({
      code: 404,
      message: 'Task not found',
      context: { taskId },
    });
  }

  const helper = await Helper.findById(helperId);
  if (!helper) {
    throw new BadRequestError({
      code: 404,
      message: 'Helper not found',
      context: { helperId },
    });
  }

  await task.applyHelper(helperId);
  await helper.applyForTask(taskId);
  return res.json({
    message: 'Applied successfully',
  });
};

// @desc CANCEL APPLICATION
// @route DELETE /tasks/apply
// @access Private
const cancelApplication = async (req: Request, res: Response) => {
  const { taskId } = req.body;
  const helperId = res.locals.id;
  if (!taskId || !helperId || !isValidObjectId(taskId) || !isValidObjectId(helperId)) {
    throw new BadRequestError({
      code: 400,
      message: 'Task Id and Helper Id are required',
      context: { fields: ['taskId', 'helperId'] },
    });
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new BadRequestError({
      code: 404,
      message: 'Task not found',
      context: { taskId },
    });
  }

  const helper = await Helper.findById(helperId);
  if (!helper) {
    throw new BadRequestError({
      code: 404,
      message: 'Helper not found',
      context: { helperId },
    });
  }

  await task.cancelHelper(helperId);
  await helper.cancelTask(taskId);

  return res.json({
    message: 'Application cancelled successfully',
  });
};

// @desc GET TASK CATEGORIES
// @route GET /tasks/categories
// @access Private
const getAllTaskCategories = async (req: Request, res: Response) => {
  const categories = await Category.find();
  return res.json({ categories });
};

export default {
  getAllTask,
  createTask,
  updateTask,
  deleteTask,
  applyForTask,
  cancelApplication,
  getAllTaskCategories,
};
