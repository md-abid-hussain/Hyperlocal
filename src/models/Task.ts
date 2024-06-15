import { Schema, model, Document } from 'mongoose';
import { BadRequestError } from '../errors/CustomError';
import PointSchema from './PointSchema';
import Helper from './Helper';

interface ILocation {
  type: string;
  coordinates: number[];
}

interface ITask extends Document {
  title: string;
  description: string;
  category: Schema.Types.ObjectId;
  location: ILocation;
  status: string;
  specialInstructions: string[];
  owner: Schema.Types.ObjectId;
  budget: number;
  appliedHelpers: Schema.Types.ObjectId[];
  assignedHelper: Schema.Types.ObjectId;
  applyHelper(this: ITask, helperId: Schema.Types.ObjectId): Promise<this>;
  cancelHelper(this: ITask, helperId: Schema.Types.ObjectId): Promise<this>;
  deleteTask(this: ITask): Promise<this>;
}

// Task schema
const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    status: { type: String, enum: ['NEW', 'IN_PROGRESS', 'DONE'], default: 'NEW' },
    location: {
      type: PointSchema,
      required: true,
    },
    specialInstructions: { type: [String], default: [] },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    budget: { type: Number, default: 0 },
    appliedHelpers: {
      type: [Schema.Types.ObjectId],
      ref: 'Helper',
      default: [],
    },
    assignedHelper: { type: Schema.Types.ObjectId, ref: 'Helper', default: null },
  },
  {
    timestamps: true,
  },
);

taskSchema.index({ location: '2dsphere' });

// Method to apply for task
taskSchema.methods.applyHelper = function (this: ITask, helperId: Schema.Types.ObjectId) {
  if (this.appliedHelpers.includes(helperId)) {
    throw new BadRequestError({
      code: 400,
      message: 'Helper already applied',
    });
  }
  this.appliedHelpers.push(helperId);
  return this.save();
};

// Method to cancel application for task
taskSchema.methods.cancelHelper = function (this: ITask, helperId: Schema.Types.ObjectId) {
  this.appliedHelpers = this.appliedHelpers.filter((id: Schema.Types.ObjectId) => String(id) !== String(helperId));
  return this.save();
};

// Method to assign helper to task
taskSchema.methods.assignHelper = function (this: ITask, helperId: Schema.Types.ObjectId) {
  this.assignedHelper = helperId;
  this.status = 'IN_PROGRESS';
  return this.save();
};

// Method to complete task
taskSchema.methods.completeTask = function (this: ITask) {
  this.status = 'DONE';
  return this.save();
};

// Method to delete task
// If task is assigned to someone it can't be deleted
// Otherwise cancel all the applied helpers
taskSchema.methods.deleteTask = async function (this: ITask) {
  if (this.assignedHelper) {
    throw new BadRequestError({
      code: 400,
      message: 'Cannot delete task with assigned helper',
    });
  }

  const taskAppliedHelpers = this.appliedHelpers;

  try {
    await Promise.all(
      taskAppliedHelpers.map(async (helperId: Schema.Types.ObjectId) => {
        const helper = await Helper.findById(helperId);
        if (helper) {
          await helper.cancelTask(this._id);
        }
      }),
    );
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw new BadRequestError({
        code: 500,
        message: 'Failed to delete task',
        context: { error: error.message },
      });
    } else {
      throw error;
    }
  }
  await this.deleteOne();
};

const Task = model<ITask>('Task', taskSchema);

export default Task;
