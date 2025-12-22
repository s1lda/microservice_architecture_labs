import Article from './Article';
import Comment from './Comment';

Article.hasMany(Comment, { foreignKey: 'articleId', as: 'comments' });
Comment.belongsTo(Article, { foreignKey: 'articleId', as: 'article' });

export { Article, Comment };
