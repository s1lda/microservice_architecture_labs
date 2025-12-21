import { z } from 'zod';

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

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
