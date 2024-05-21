import { Schema, model } from 'mongoose';
import PointSchema from './pointSchema';
import Task from './Task';
import { BadRequestError } from '../errors/CustomError';

interface ILocation {
  type: string;
  coordinates: number[];
}

interface IUser {
  name: string;
  email: string;
  username: string;
  password: string;
  location?: ILocation;
  deleteAccount(): Promise<void>;
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
  },
  { timestamps: true },
);

userSchema.index({ location: '2dsphere' });

// Method to delete account
// This method will delete all tasks created by the user
// User will not be able to delete the account if there is any task assigned to helper
userSchema.methods.deleteAccount = async function () {
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
};

const User = model<IUser>('User', userSchema);

export default User;
