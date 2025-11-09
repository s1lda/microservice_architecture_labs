import { z } from 'zod';

export const registerUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  bio: z.string().optional(),
  image_url: z.string().url('Invalid URL format').optional(),
});

export const loginUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  username: z.string().min(3).max(50).optional(),
  password: z.string().min(6).optional(),
  bio: z.string().optional(),
  image_url: z.string().url('Invalid URL format').optional(),
});

export const createArticleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  body: z.string().min(1, 'Body is required'),
  tagList: z.array(z.string()).optional(),
});

export const updateArticleSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  tagList: z.array(z.string()).optional(),
});

export const createCommentSchema = z.object({
  body: z.string().min(1, 'Comment body is required'),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
