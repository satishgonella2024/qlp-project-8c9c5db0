import { Application } from 'express';
import dotenv from 'dotenv';
import { dbClient } from '../database/client';
import { applySecurityMiddleware } from './security';
import { applyRateLimiting } from './rateLimiting';

dotenv.config();

dbClient.connect();

export function configureApp(app: Application): void {
  applySecurityMiddleware(app);
  applyRateLimiting(app);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
}