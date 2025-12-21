import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

// Информация о пользователе из JWT токена
// Мы НЕ обращаемся к БД пользователей, а только валидируем JWT
export interface UserInfo {
  id: number;
}

export interface AuthRequest extends Request {
  user?: UserInfo;
}

/**
 * Middleware для аутентификации через JWT
 * 
 * ВАЖНО: В микросервисной архитектуре мы НЕ обращаемся к БД пользователей.
 * Авторизация происходит через валидацию JWT токена с использованием
 * того же секретного ключа, который использовался для подписи в Users API.
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyToken(token);
      
      // Сохраняем только id пользователя из токена
      // НЕ делаем запрос к БД пользователей!
      req.user = { id: decoded.id };
      
      return next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = verifyToken(token);
        req.user = { id: decoded.id };
      } catch (error) {
        // Token invalid, but continue without user
      }
    }
    next();
  } catch (error) {
    next();
  }
};
