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
    tags,
  });

  const populatedRecipe = await Recipe.findById(recipe._id).populate('user', 'name');

  res.status(201).json({
    ...populatedRecipe._doc,
    creatorName: populatedRecipe.user?.name || 'Unknown',
    creatorId: populatedRecipe.user?._id.toString() || '',
  });
});

const getRecipes = asyncHandler(async (req, res) => {
  const recipes = await Recipe.find({}).populate('user', 'name');

  const formatted = recipes.map((recipe) => ({
    ...recipe._doc,
    creatorName: recipe.user?.name || 'Unknown',
    creatorId: recipe.user?._id.toString() || '',
  }));

  res.status(200).json(formatted);
});

const getRecipeById = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id).populate('user', 'name');

  if (!recipe) {
    res.status(404);
    throw new Error('Recipe not found');
  }

  res.status(200).json({
    ...recipe._doc,
    creatorName: recipe.user?.name || 'Unknown',
    creatorId: recipe.user?._id.toString() || '',
  });
});

const getUserRecipes = asyncHandler(async (req, res) => {
  const recipes = await Recipe.find({ user: req.user._id }).populate('user', 'name');

  const formatted = recipes.map((recipe) => ({
    ...recipe._doc,
    creatorName: recipe.user?.name || 'Unknown',
    creatorId: recipe.user?._id.toString() || '',
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

  // Only the creator can update
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

  const updatedRecipe = await recipe.save();
  res.status(200).json(updatedRecipe);
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
  upload.single('image')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      console.error('No file received in request');
      return res.status(400).json({ message: 'No image file provided' });
    }

    try {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI);

      console.log('Image uploaded to Cloudinary:', result.secure_url);
      res.status(200).json({ imageUrl: result.secure_url });
    } catch (error) {
      console.error('Cloudinary upload error:', error.message);
      res.status(500).json({ message: 'Image upload to Cloudinary failed: ' + error.message });
    }
  });
};

module.exports = {
  createRecipe,
  getRecipes,
  getRecipeById,
  getUserRecipes,
  updateRecipe,
  deleteRecipe,
  uploadImage,
  upload,
};