import Article from './Article';
import Comment from './Comment';

// Define associations - только между Article и Comment
// Связи с User убраны, так как users теперь в отдельном микросервисе
Article.hasMany(Comment, { foreignKey: 'articleId', as: 'comments' });
Comment.belongsTo(Article, { foreignKey: 'articleId', as: 'article' });

export { Article, Comment };
