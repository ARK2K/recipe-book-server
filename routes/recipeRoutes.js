const express = require('express');
const asyncHandler = require('express-async-handler');
const Recipe = require('../models/Recipe');
const cloudinary = require('../config/cloudinaryConfig');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
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

  res.status(201).json(recipe);
});

const getRecipes = asyncHandler(async (req, res) => {
  const recipes = await Recipe.find({});
  res.status(200).json(recipes);
});

const getRecipeById = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (recipe) {
    res.status(200).json(recipe);
  } else {
    res.status(404);
    throw new Error('Recipe not found');
  }
});

const getUserRecipes = asyncHandler(async (req, res) => {
  const recipes = await Recipe.find({ user: req.user._id });
  res.status(200).json(recipes);
});

const updateRecipe = asyncHandler(async (req, res) => {
  const { title, description, ingredients, instructions, imageUrl, category, tags } = req.body;

  const recipe = await Recipe.findById(req.params.id);

  if (recipe) {
    if (recipe.user.toString() !== req.user.id) {
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
  } else {
    res.status(404);
    throw new Error('Recipe not found');
  }
});

const deleteRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (recipe) {
    if (recipe.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized');
    }
    await recipe.deleteOne();
    res.status(200).json({ message: 'Recipe removed' });
  } else {
    res.status(404);
    throw new Error('Recipe not found');
  }
});

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided');
  }

  const b64 = Buffer.from(req.file.buffer).toString('base64');
  const dataURI = `data:${req.file.mimetype};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataURI);
  res.status(200).json({ imageUrl: result.secure_url });
});

router.get('/my-recipes', protect, getUserRecipes);
router.get('/', getRecipes);
router.post('/', protect, createRecipe);
router.get('/:id', getRecipeById);
router.put('/:id', protect, updateRecipe);
router.delete('/:id', protect, deleteRecipe);
router.post('/upload', protect, upload.single('image'), uploadImage);

module.exports = router;