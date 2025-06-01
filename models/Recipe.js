const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  ingredients: [{ type: String, required: true }],
  instructions: { type: String, required: true },
  image: { type: String, default: '' }, // URL from Cloudinary
  category: { type: String }, // Optional
  tags: [{ type: String }],    // Optional
  ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      stars: { type: Number, min: 1, max: 5 }
    }
  ],
  averageRating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Calculate average rating
RecipeSchema.methods.calculateAverageRating = function() {
  let totalStars = 0;
  this.ratings.forEach(rating => {
    totalStars += rating.stars;
  });
  this.averageRating = this.ratings.length > 0 ? (totalStars / this.ratings.length) : 0;
  this.numReviews = this.ratings.length;
};


module.exports = mongoose.model('Recipe', RecipeSchema);