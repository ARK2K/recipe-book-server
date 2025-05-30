const Recipe = require('../models/Recipe');

exports.createRecipe = async (req, res) => {
  const recipe = await Recipe.create({ ...req.body, author: req.userId });
  res.json(recipe);
};

exports.getMyRecipes = async (req, res) => {
  const recipes = await Recipe.find({ author: req.userId });
  res.json(recipes);
};

exports.getSharedRecipes = async (req, res) => {
  const recipes = await Recipe.find({ sharedWith: req.userId });
  res.json(recipes);
};

exports.searchRecipes = async (req, res) => {
  const { ingredient } = req.query;
  const recipes = await Recipe.find({
    ingredients: { $regex: ingredient, $options: 'i' },
    $or: [
      { author: req.userId },
      { sharedWith: req.userId }
    ]
  });
  res.json(recipes);
};

exports.getRecipeById = async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe || (recipe.author.toString() !== req.userId && !recipe.sharedWith.includes(req.userId))) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  res.json(recipe);
};

exports.updateRecipe = async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe || recipe.author.toString() !== req.userId) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  Object.assign(recipe, req.body);
  await recipe.save();
  res.json(recipe);
};

exports.deleteRecipe = async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe || recipe.author.toString() !== req.userId) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  await recipe.remove();
  res.json({ message: 'Deleted' });
};

exports.rateRecipe = async (req, res) => {
  const { score } = req.body;
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

  const existingRating = recipe.ratings.find(r => r.user.toString() === req.userId);
  if (existingRating) {
    existingRating.score = score;
  } else {
    recipe.ratings.push({ user: req.userId, score });
  }

  await recipe.save();
  res.json(recipe);
};

exports.shareRecipe = async (req, res) => {
  const { userIdToShare } = req.body;
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe || recipe.author.toString() !== req.userId) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  if (!recipe.sharedWith.includes(userIdToShare)) {
    recipe.sharedWith.push(userIdToShare);
    await recipe.save();
  }
  res.json({ message: 'Shared' });
};