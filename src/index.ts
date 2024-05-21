import dotenv from 'dotenv';
dotenv.config();
import 'express-async-errors';
import express, { type Express, type Request, type Response } from 'express';
import mongoose from 'mongoose';
import connectDB from './config/db';
import cookieParser from 'cookie-parser';
import { logger } from './middlewares/logEvent';
import { errorHandler } from './middlewares/errorHandler';
import { BadRequestError } from './errors/CustomError';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import helperRoutes from './routes/helperRoutes'
import taskRoutes from './routes/taskRoutes';

connectDB();

const app: Express = express();
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const port = process.env.PORT ?? 3000;

app.get('/', (req: Request, res: Response) => {
  return res.json({
    message: 'Done',
  });
});
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/helpers', helperRoutes);
app.use('/tasks', taskRoutes);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.all('*', (req: Request, res: Response) => {
  throw new BadRequestError({
    code: 404,
    message: `method ${req.method} not allowed on ${req.originalUrl} on this server`,
    context: { method: req.method, url: req.originalUrl },
  });
});

app.use(errorHandler);

mongoose.connection.once('open', () => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
