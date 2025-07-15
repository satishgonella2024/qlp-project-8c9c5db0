import { Request, Response } from 'express';

export function createUser(req: Request, res: Response) {
  res.status(201).json({ message: 'User created' });
}

export function getUser(req: Request, res: Response) {
  res.status(200).json({ user: { id: req.params.id } });
}

export function updateUser(req: Request, res: Response) {
  res.status(200).json({ message: 'User updated' });
}

export function deleteUser(req: Request, res: Response) {
  res.status(204).json({ message: 'User deleted' });
}