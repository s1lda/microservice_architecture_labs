import { Response } from 'express';
import { Comment, Article, User } from '../models';
import { AuthRequest } from '../middleware/auth';
import { CreateCommentInput } from '../utils/validation';

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { slug } = req.params;
    const { body } = req.body as CreateCommentInput;

    const article = await Article.findOne({ where: { slug } });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const comment = await Comment.create({
      body,
      articleId: article.id,
      authorId: req.user.id,
    });

    return res.status(201).json({
      comment: {
        id: comment.id,
        body: comment.body,
        author: {
          id: req.user.id,
          username: req.user.username,
          bio: req.user.bio,
          image_url: req.user.image_url,
        },
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      },
    });
  } catch (error) {
    console.error('Add comment error:', error);
    return res.status(500).json({ error: 'Server error adding comment' });
  }
};

export const getComments = async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;

    const article = await Article.findOne({ where: { slug } });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const comments = await Comment.findAll({
      where: { articleId: article.id },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'bio', 'image_url'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      comments: comments.map((comment) => ({
        id: comment.id,
        body: comment.body,
        author: comment.get('author'),
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({ error: 'Server error fetching comments' });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { slug, id } = req.params;

    const article = await Article.findOne({ where: { slug } });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const comment = await Comment.findOne({
      where: {
        id: parseInt(id),
        articleId: article.id,
      },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.authorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    await comment.destroy();

    return res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({ error: 'Server error deleting comment' });
  }
};
