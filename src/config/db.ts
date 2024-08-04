import mongoose from 'mongoose';
// import reset from './reset'
// import seed from './seed'

const dbUrl = process.env.DATABASE_URL as string;
const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log('Database connected successfully');
    // reset()
    // seed()
  } catch (err) {
    console.log(err);
  }
};

export default connectDB;
