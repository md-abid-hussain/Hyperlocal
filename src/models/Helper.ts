import { Schema, model, Document } from 'mongoose';
import PointSchema from './pointSchema';
import { BadRequestError } from '../errors/CustomError';
import Task from './Task';

interface ILocation {
  type: string;
  coordinates: number[];
}

interface IHelper extends Document {
  name: string;
  email: string;
  username: string;
  location: ILocation;
  password: string;
  skills: string[];
  experience: string;
  availability: boolean;
  rating: number;
  appliedTasks: Schema.Types.ObjectId[];
  assignedTasks: Schema.Types.ObjectId[];
  completedTasks: Schema.Types.ObjectId[];
  isVerified: boolean;
  isActive: boolean;
  isProfileComplete: boolean;
  applyForTask(this: IHelper, taskId: Schema.Types.ObjectId): Promise<this>;
  cancelTask(this: IHelper, taskId: Schema.Types.ObjectId): Promise<this>;
  deleteAccount(this: IHelper): Promise<this>;
}

const helperSchema = new Schema<IHelper>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true, select: false },
    location: {
      type: PointSchema,
    },
    skills: { type: [String], default: [] },
    experience: { type: String, default: '' },
    availability: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    appliedTasks: {
      type: [Schema.Types.ObjectId],
      ref: 'Task',
      default: [],
    },
    assignedTasks: {
      type: [Schema.Types.ObjectId],
      ref: 'Task',
      default: [],
    },
    completedTasks: {
      type: [Schema.Types.ObjectId],
      ref: 'Task',
      default: [],
    },
    isVerified: { type: Boolean, default: false },
    isProfileComplete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

helperSchema.index({ location: '2dsphere' });

// Method to apply for task
helperSchema.methods.applyForTask = function (this: IHelper, taskId: Schema.Types.ObjectId) {
  if (this.appliedTasks.includes(taskId)) {
    throw new BadRequestError({
      code: 400,
      message: 'Already applied to task',
    });
  }
  this.appliedTasks.push(taskId);
  return this.save();
};

// Method to cancel task application
helperSchema.methods.cancelTask = function (this: IHelper, taskId: Schema.Types.ObjectId) {
  this.appliedTasks = this.appliedTasks.filter((id: Schema.Types.ObjectId) => String(id) !== String(taskId));
  return this.save();
};

// Method to delete helper
// This method will also cleared all the applied tasks
// Helper are not allowed to delete their account if they have assigned tasks
helperSchema.methods.deleteAccount = async function (this: IHelper) {
  if (this.assignedTasks.length > 0) {
    throw new BadRequestError({
      code: 400,
      message: 'Cannot delete helper with assigned tasks',
    });
  }

  const helperAppliedTask = this.appliedTasks;

  try {
    await Promise.all(
      helperAppliedTask.map(async (taskId: Schema.Types.ObjectId) => {
        const task = await Task.findById(taskId);
        if (task) {
          await task.cancelHelper(this._id);
        }
      }),
    );
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw new BadRequestError({
        code: 500,
        message: 'Failed to delete helper account',
        context: {
          error: error.message,
        },
      });
    } else {
      throw error;
    }
  }
  this.isActive = false;
  this.availability = false;
  this.save();
};

const Helper = model<IHelper>('Helper', helperSchema);

export default Helper;
