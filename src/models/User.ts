import { Schema, model } from 'mongoose';
import PointSchema from './pointSchema';

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
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    location: {
      type: PointSchema,
    }
  },
  { timestamps: true },
);

userSchema.index({ location: '2dsphere' });

const User = model<IUser>('User', userSchema);

export default User;
