const asyncHandler = require('express-async-handler');
const Recipe = require('../models/Recipe');
const cloudinary = require('../config/cloudinaryConfig');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const createRecipe = asyncHandler(async (req, res) => {
  const { title, description, ingredients, instructions, imageUrl, category, tags } = req.body;
  if (!title || !description || !ingredients || !instructions) {
    res.status(400);
    throw new Error('Please fill all required fields');
  }

  const recipe = await Recipe.create({
    user: req.user._id,
    title,
    description,
    ingredients,
    instructions,
    imageUrl,
    category,
    tags
  });

  const populated = await Recipe.findById(recipe._id).populate('user', 'name');
  res.status(201).json({ ...populated._doc, creatorName: populated.user?.name || 'Unknown', creatorId: populated.user?._id.toString() });
});

const getRecipes = asyncHandler(async (req, res) => {
  const { category, tag } = req.query;
  let filter = {};
  if (category) filter.category = category;
  if (tag) filter.tags = tag;

  const recipes = await Recipe.find(filter).populate('user', 'name');
  const formatted = recipes.map(r => ({
    ...r._doc,
    creatorName: r.user?.name || 'Unknown',
    creatorId: r.user?._id.toString()
  }));
  res.status(200).json(formatted);
});

const getRecipeById = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id)
    .populate('user', 'name')
    .populate('comments.user', 'name');

  if (!recipe) {
    res.status(404);
    throw new Error('Recipe not found');
  }

  res.status(200).json({
    ...recipe._doc,
    creatorName: recipe.user?.name || 'Unknown',
    creatorId: recipe.user?._id.toString() || ''
  });
});

const getUserRecipes = asyncHandler(async (req, res) => {
  const recipes = await Recipe.find({ user: req.user._id }).populate('user', 'name');
  const formatted = recipes.map(r => ({
    ...r._doc,
    creatorName: r.user?.name || 'Unknown',
    creatorId: r.user?._id.toString()
  }));
  res.status(200).json(formatted);
});

const updateRecipe = asyncHandler(async (req, res) => {
  const { title, description, ingredients, instructions, imageUrl, category, tags } = req.body;
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) {
    res.status(404);
    throw new Error('Recipe not found');
  }
  if (recipe.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  recipe.title = title || recipe.title;
  recipe.description = description || recipe.description;
  recipe.ingredients = ingredients || recipe.ingredients;
  recipe.instructions = instructions || recipe.instructions;
  recipe.imageUrl = imageUrl || recipe.imageUrl;
  recipe.category = category || recipe.category;
  recipe.tags = tags || recipe.tags;

  const updated = await recipe.save();
  res.status(200).json(updated);
});

const deleteRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) {
    res.status(404);
    throw new Error('Recipe not found');
  }
  if (recipe.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await recipe.deleteOne();
  res.status(200).json({ message: 'Recipe removed' });
});

const uploadImage = (req, res) => {
  upload.single('image')(req, res, async err => {
    if (err || !req.file) {
      return res.status(400).json({ message: err?.message || 'No image file provided' });
    }

    try {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI);
      res.status(200).json({ imageUrl: result.secure_url });
    } catch (error) {
      res.status(500).json({ message: 'Image upload failed: ' + error.message });
    }
  });
};

const toggleLike = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) {
    res.status(404);
    throw new Error('Recipe not found');
  }

  const index = recipe.likes.indexOf(req.user._id);
  if (index > -1) {
    recipe.likes.splice(index, 1);
  } else {
    recipe.likes.push(req.user._id);
  }

  await recipe.save();
  res.status(200).json({ likes: recipe.likes.length, liked: index === -1 });
});

const rateRecipe = asyncHandler(async (req, res) => {
  const { stars } = req.body;
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) {
    res.status(404);
    throw new Error('Recipe not found');
  }

  const existing = recipe.ratings.find(r => r.user.toString() === req.user._id.toString());
  if (existing) {
    existing.stars = stars;
  } else {
    recipe.ratings.push({ user: req.user._id, stars });
  }

  recipe.calculateAverageRating();
  await recipe.save();
  res.status(200).json({ averageRating: recipe.averageRating, numReviews: recipe.numReviews });
});

const addComment = asyncHandler(async (req, res) => {
  const { comment, rating } = req.body;
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) {
    res.status(404);
    throw new Error('Recipe not found');
  }

  recipe.comments.push({ user: req.user._id, comment, rating });
  await recipe.save();
  res.status(201).json({ message: 'Comment added' });
});

module.exports = {
  createRecipe,
  getRecipes,
  getRecipeById,
  getUserRecipes,
  updateRecipe,
  deleteRecipe,
  uploadImage,
  upload,
  toggleLike,
  rateRecipe,
  addComment
};