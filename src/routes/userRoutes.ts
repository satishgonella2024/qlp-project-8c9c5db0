import { Application, Request, Response, NextFunction } from 'express';
import { dbClient } from '../database/client';
import bcrypt from 'bcrypt';
import { User } from '../models/User';

export function userRoutes(app: Application): void {
  app.post('/users', async (req: Request, res: Response, next: NextFunction) => { /* Create user logic here */ });
  app.get('/users/:id', async (req: Request, res: Response, next: NextFunction) => { /* Read user logic here */ });
  app.put('/users/:id', async (req: Request, res: Response, next: NextFunction) => { /* Update user logic here */ });
  app.delete('/users/:id', async (req: Request, res: Response, next: NextFunction) => { /* Delete user logic here */ });
}