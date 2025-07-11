const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  ingredients: [{ type: String, required: true }],
  instructions: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  category: { type: String },
  tags: [{ type: String }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      stars: { type: Number, min: 1, max: 5 }
    }
  ],
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: { type: String, required: true },
      stars: { type: Number, min: 1, max: 5 },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  averageRating: { type: Number, default: 0 },
  numFavorites: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

RecipeSchema.methods.calculateMetrics = function () {
  this.numFavorites = this.favorites.length;
  this.numReviews = this.comments.length;
  if (this.ratings.length) {
    const total = this.ratings.reduce((acc, r) => acc + r.stars, 0);
    this.averageRating = total / this.ratings.length;
  } else {
    this.averageRating = 0;
  }
};

module.exports = mongoose.model('Recipe', RecipeSchema);