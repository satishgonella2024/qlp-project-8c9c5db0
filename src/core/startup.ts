import { Application } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import { userRouter } from './routes/userRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

export function applyMiddleware(app: Application): void {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));
  app.use(helmet());
  app.use(cors());
}

export function applyRoutes(app: Application): void {
  app.use('/api/users', userRouter);
  app.use(errorHandler);
}