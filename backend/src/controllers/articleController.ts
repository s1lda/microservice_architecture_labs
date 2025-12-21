import { Response } from 'express';
import { Article } from '../models';
import { AuthRequest } from '../middleware/auth';
import { CreateArticleInput, UpdateArticleInput } from '../utils/validation';

export const createArticle = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { title, description, body, tagList } = req.body as CreateArticleInput;

    const article = await Article.create({
      title,
      description,
      body,
      tagList: tagList || [],
      authorId: req.user.id, // Сохраняем ID пользователя из JWT
    });

    return res.status(201).json({
      article: {
        id: article.id,
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: article.tagList,
        authorId: article.authorId,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      },
    });
  } catch (error) {
    console.error('Create article error:', error);
    return res.status(500).json({ error: 'Server error creating article' });
  }
};

export const getArticles = async (_req: AuthRequest, res: Response) => {
  try {
    const articles = await Article.findAll({
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      articles: articles.map((article) => ({
        id: article.id,
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: article.tagList,
        authorId: article.authorId,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get articles error:', error);
    return res.status(500).json({ error: 'Server error fetching articles' });
  }
};

export const getArticleBySlug = async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;

    const article = await Article.findOne({
      where: { slug },
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    return res.status(200).json({
      article: {
        id: article.id,
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: article.tagList,
        authorId: article.authorId,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get article error:', error);
    return res.status(500).json({ error: 'Server error fetching article' });
  }
};

export const updateArticle = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { slug } = req.params;
    const updates = req.body as UpdateArticleInput;

    const article = await Article.findOne({ where: { slug } });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    if (article.authorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this article' });
    }

    await article.update(updates);

    return res.status(200).json({
      article: {
        id: article.id,
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: article.tagList,
        authorId: article.authorId,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update article error:', error);
    return res.status(500).json({ error: 'Server error updating article' });
  }
};

export const deleteArticle = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { slug } = req.params;

    const article = await Article.findOne({ where: { slug } });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    if (article.authorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this article' });
    }

    await article.destroy();

    return res.status(200).json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Delete article error:', error);
    return res.status(500).json({ error: 'Server error deleting article' });
  }
};
