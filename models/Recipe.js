import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  ingredients: [String],
  rating: { type: Number, default: 0 },
  createdBy: String,
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Recipe', recipeSchema);