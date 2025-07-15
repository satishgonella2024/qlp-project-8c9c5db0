import { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';

export function applySecurityMiddleware(app: Application): void {
  app.use(helmet());
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true,
  }));
}