import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/sequelize';
import slugify from 'slugify';

interface ArticleAttributes {
  id: number;
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList?: string[];
  authorId: number; // Логическая ссылка на user.id БЕЗ внешнего ключа
  createdAt?: Date;
  updatedAt?: Date;
}

interface ArticleCreationAttributes extends Optional<ArticleAttributes, 'id' | 'slug' | 'tagList'> {}

class Article extends Model<ArticleAttributes, ArticleCreationAttributes> implements ArticleAttributes {
  public id!: number;
  public slug!: string;
  public title!: string;
  public description!: string;
  public body!: string;
  public tagList?: string[];
  public authorId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Article.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tagList: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'articles',
    hooks: {
      beforeValidate: (article: Article) => {
        if (article.title && !article.slug) {
          article.slug = slugify(article.title, { lower: true, strict: true }) + '-' + Date.now();
        }
      },
    },
  }
);

export default Article;
