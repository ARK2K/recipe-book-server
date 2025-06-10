const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comment: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now }
});

const RecipeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  ingredients: [{ type: String, required: true }],
  instructions: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  category: { type: String },
  tags: [{ type: String }],
  ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      stars: { type: Number, min: 1, max: 5 }
    }
  ],
  comments: [CommentSchema],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  averageRating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

RecipeSchema.methods.calculateAverageRating = function () {
  const total = this.ratings.reduce((acc, r) => acc + r.stars, 0);
  this.averageRating = this.ratings.length ? total / this.ratings.length : 0;
  this.numReviews = this.ratings.length;
};

module.exports = mongoose.model('Recipe', RecipeSchema);