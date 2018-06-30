const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const slug = require('slug');
const {Schema} = mongoose;
const User = mongoose.model('User');

const ArticleSchema = new Schema({
  slug: {
    type: String,
    lowercase: true,
    unique: true
  },
  title: String,
  description: String,
  body: String,
  favoritesCount: {
    type: Number,
    default: 0
  },
  tagList: [{type: String}],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  usePushEach: true,
});

ArticleSchema.plugin(uniqueValidator, {message: "is already taken"});

ArticleSchema.methods.slugify = function () {
  this.slug = slug(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36); // "|" is a bitwise or operator
};

ArticleSchema.methods.toJSONFor = function (user) {
  return {
      slug: this.slug,
      title: this.title,
      description: this.description,
      body: this.body,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      tagList: this.tagList,
      favorited: user ? user.isFavorite(this._id) : false,
      favoritesCount: this.favoritesCount,
      author: this.author.toProfileJSONFor(user)
  };
};

ArticleSchema.methods.updateFavoriteCount = function () {
  const article = this;
  return User.count({
    favorites: {$in: [article._id]} // See operators in mongodb manual
  }).then(count => {
    article.favoritesCount = count;
    return article.save();
  });
};

ArticleSchema.pre('validate', function(next) {
  if (!this.slug) {
    this.slugify();
  }
  next();
});

const articleModel = mongoose.model('Article', ArticleSchema);

module.exports = articleModel;