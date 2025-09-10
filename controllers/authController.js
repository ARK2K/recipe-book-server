const User = require('../models/User');

const getUserProfile = async (req, res) => {
  const userId = req.auth.userId; // Clerk user ID from middleware
  
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  // Find or create profile for Clerk user
  let user = await User.findOne({ clerkId: userId });
  if (!user) {
    user = await User.create({ clerkId: userId, name: 'Unknown', email: '' });
  }

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    favorites: user.favorites,
  });
};

const toggleFavorite = async (req, res) => {
  const userId = req.auth.userId;
  const recipeId = req.params.id;

  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const index = user.favorites.indexOf(recipeId);
  if (index > -1) {
    user.favorites.splice(index, 1);
  } else {
    user.favorites.push(recipeId);
  }

  await user.save();

  res.status(200).json({ message: 'Favorites updated', favorites: user.favorites });
};

module.exports = {
  getUserProfile,
  toggleFavorite,
};