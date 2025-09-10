const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  ingredients: [{ type: String, required: true, trim: true, minlength: 1 }],
  instructions: { type: String, required: true, trim: true },
  imageUrl: { type: String, default: '' },
  category: { type: String, trim: true },
  tags: [{ type: String, trim: true }],
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
      text: { type: String, required: true, trim: true },
      stars: { type: Number, min: 1, max: 5 },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  averageRating: { type: Number, default: 0 },
  numFavorites: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 }
}, { timestamps: true });

// Indexes
RecipeSchema.index({ category: 1 });
RecipeSchema.index({ tags: 1 });
RecipeSchema.index({ user: 1 });

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