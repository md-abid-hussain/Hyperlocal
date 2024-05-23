import { Schema, model, Document } from 'mongoose';
import PointSchema from './pointSchema';
import Task from './Task';
import { BadRequestError } from '../errors/CustomError';

interface ILocation {
  type: string;
  coordinates: number[];
}

interface IUser extends Document {
  name: string;
  email: string;
  username: string;
  password: string;
  location?: ILocation;
  isActive: boolean;
  deleteAccount(this: IUser): Promise<void>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    location: {
      type: PointSchema,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.index({ location: '2dsphere' });

// Method to delete account
// This method will delete all tasks created by the user
// User will not be able to delete the account if there is any task assigned to helper
userSchema.methods.deleteAccount = async function (this: IUser) {
  const userId = this._id;

  const userCreatedTasks = await Task.find({ owner: userId });

  try {
    await Promise.all(
      userCreatedTasks.map(async (task) => {
        await task.deleteTask();
      }),
    );
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw new BadRequestError({
        code: 500,
        message: 'Cannot delete account',
        context: { error: error.message },
      });
    } else {
      throw error;
    }
  }

  this.isActive = false;
  this.save();
};

const User = model<IUser>('User', userSchema);

export default User;
