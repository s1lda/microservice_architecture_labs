import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Используется тот же JWT_SECRET, что и в users-api для валидации токенов
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const verifyToken = (token: string): { id: number } => {
  return jwt.verify(token, JWT_SECRET) as { id: number };
};
