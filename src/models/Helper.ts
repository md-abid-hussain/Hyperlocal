import { Schema, model } from 'mongoose';
import pointSchema from './pointSchema';
import { BadRequestError } from '../errors/CustomError';

interface ILocation {
  type: string;
  coordinates: number[];
}

interface IHelper {
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
  applyForTask(taskId: Schema.Types.ObjectId): Promise<this>;
  cancelTask(taskId: Schema.Types.ObjectId): Promise<this>;
}

const helperSchema = new Schema<IHelper>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true, select: false },
    location: {
      type: pointSchema,
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
  },
  {
    timestamps: true,
  },
);

helperSchema.index({ location: '2dsphere' });

// Method to apply for task
helperSchema.methods.applyForTask = function (taskId: Schema.Types.ObjectId) {
  if (!this.appliedTasks.includes(taskId)) {
    this.appliedTasks.push(taskId);
    return this.save();
  }
  throw new BadRequestError({
    code: 400,
    message: 'Already applied to task',
  });
};

// Method to cancel task application
helperSchema.methods.cancelTask = function (taskId: Schema.Types.ObjectId) {
  this.appliedTasks = this.appliedTasks.filter((id: Schema.Types.ObjectId) => String(id) !== String(taskId));
  return this.save();
};

const Helper = model<IHelper>('Helper', helperSchema);

export default Helper;
