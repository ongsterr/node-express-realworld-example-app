const mongoose = require('mongoose'),
      uniqueValidator = require('mongoose-unique-validator'),
      crypto = require('crypto'),
      jwt = require('jsonwebtoken'),
      secret = require('../config').secret,
      {Schema} = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, "Can't be blank"],
    match: [/^[a-zA-Z0-9]+$/, "is invalid"],
    index: true
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, "Can't be blank"],
    match: [/\S+@\S+\.\S+/, "is invalid"],
    index: true
  },
  bio: String,
  image: String,
  hash: String,
  salt: String,
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
}, {
  timestamps: true,
  usePushEach: true,
});

UserSchema.plugin(uniqueValidator, {message: "is already taken"});

UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.validatePassword = function (password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

UserSchema.methods.generateJWT = function () {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000) 
  }, secret);
};

UserSchema.methods.toAuthJSON = function () {
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT(),
    bio: this.bio,
    image: this.image,
  };
};

UserSchema.methods.toProfileJSONFor = function (user) {
  return {
    username: this.username,
    bio: this.bio,
    image: this.image || 'https://static.productionready.io/images/smiley-cyrus.jpg',
    following: false
  };
};

UserSchema.methods.favorite = function (id) {
  if (this.favorites.indexOf(id) === -1) {
    this.favorites = this.favorites.concat([id]);
  }
  return this.save();
}

UserSchema.methods.unfavorite = function (id) {
  this.favorites.remove(id); // document.remove() seems to be different from model.remove(). Clarify more.
  return this.save();
}

UserSchema.methods.isFavorite = function (id) {
  return this.favorites.some(favoriteId => { // The some() method tests whether at least one element in the array passes the test implemented by the provided function.
    return favoriteId.toString() === id.toString();
  });
};

const userModel = mongoose.model('User', UserSchema);

module.exports = userModel;