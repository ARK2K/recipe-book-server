const Recipe = require('../models/Recipe');

const getRecipes = async (req, res) => {
  const page = +req.query.page || 1;
  const limit = +req.query.limit || 6;
  const search = req.query.search || '';

  const query = search
    ? {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { ingredients: { $regex: search, $options: 'i' } },
        ],
      }
    : {};

  const total = await Recipe.countDocuments(query);
  const recipes = await Recipe.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({ recipes, total });
};

const getRecipeById = async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
  res.json(recipe);
};

const createRecipe = async (req, res) => {
  const { title, description, ingredients } = req.body;
  const recipe = new Recipe({
    title,
    description,
    ingredients,
    createdBy: req.user.name,
    userId: req.user._id,
  });
  const created = await recipe.save();
  res.status(201).json(created);
};

const updateRecipe = async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
  if (recipe.userId.toString() !== req.user._id.toString())
    return res.status(401).json({ message: 'Not authorized' });

  Object.assign(recipe, req.body);
  const updated = await recipe.save();
  res.json(updated);
};

const deleteRecipe = async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
  if (recipe.userId.toString() !== req.user._id.toString())
    return res.status(401).json({ message: 'Not authorized' });

  await recipe.deleteOne();
  res.json({ message: 'Recipe deleted' });
};

const rateRecipe = async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  try {
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Use userId field for ratings array
    const existing = recipe.ratings.find(r => r.userId.toString() === req.user._id.toString());
    if (existing) {
      existing.rating = rating; // update existing rating
    } else {
      recipe.ratings.push({ userId: req.user._id, rating });
    }

    await recipe.save();

    // Return updated recipe with averageRating virtual included
    res.status(200).json(recipe);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  rateRecipe,
};