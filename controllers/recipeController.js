const Recipe = require('../models/Recipe');
const { validationResult } = require('express-validator');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper for image upload (using multer in routes)
const uploadImageToCloudinary = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ resource_type: "auto" }, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    }).end(fileBuffer);
  });
};

// @desc    Create new recipe
// @route   POST /api/recipes
// @access  Private
const createRecipe = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, ingredients, instructions, category, tags } = req.body;
  let imageUrl = '';

  if (req.file) {
    try {
      imageUrl = await uploadImageToCloudinary(req.file.buffer);
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return res.status(500).json({ message: 'Image upload failed' });
    }
  }

  try {
    const recipe = new Recipe({
      user: req.user._id,
      title,
      description,
      ingredients: JSON.parse(ingredients), // Ingredients might come as stringified array
      instructions,
      image: imageUrl,
      category,
      tags: tags ? JSON.parse(tags) : [],
    });

    const createdRecipe = await recipe.save();
    res.status(201).json(createdRecipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all recipes
// @route   GET /api/recipes
// @access  Public
const getRecipes = async (req, res) => {
  try {
    const pageSize = 10; // Number of recipes per page
    const page = Number(req.query.pageNumber) || 1;
    const keyword = req.query.keyword
      ? {
          $or: [
            { title: { $regex: req.query.keyword, $options: 'i' } },
            { ingredients: { $regex: req.query.keyword, $options: 'i' } }
          ]
        }
      : {};

    const count = await Recipe.countDocuments({ ...keyword });
    const recipes = await Recipe.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .populate('user', 'name'); // Populate user's name

    res.json({ recipes, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single recipe by ID
// @route   GET /api/recipes/:id
// @access  Public
const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('user', 'name');
    if (recipe) {
      res.json(recipe);
    } else {
      res.status(404).json({ message: 'Recipe not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a recipe
// @route   PUT /api/recipes/:id
// @access  Private (only creator)
const updateRecipe = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, ingredients, instructions, category, tags } = req.body;
  let imageUrl = '';

  try {
    const recipe = await Recipe.findById(req.params.id);

    if (recipe) {
      if (recipe.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to update this recipe' });
      }

      if (req.file) {
        imageUrl = await uploadImageToCloudinary(req.file.buffer);
        recipe.image = imageUrl;
      }

      recipe.title = title || recipe.title;
      recipe.description = description || recipe.description;
      recipe.ingredients = ingredients ? JSON.parse(ingredients) : recipe.ingredients;
      recipe.instructions = instructions || recipe.instructions;
      recipe.category = category || recipe.category;
      recipe.tags = tags ? JSON.parse(tags) : recipe.tags;

      const updatedRecipe = await recipe.save();
      res.json(updatedRecipe);
    } else {
      res.status(404).json({ message: 'Recipe not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a recipe
// @route   DELETE /api/recipes/:id
// @access  Private (only creator)
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (recipe) {
      if (recipe.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to delete this recipe' });
      }
      await Recipe.deleteOne({ _id: req.params.id }); // Use deleteOne
      res.json({ message: 'Recipe removed' });
    } else {
      res.status(404).json({ message: 'Recipe not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Rate a recipe
// @route   POST /api/recipes/:id/rate
// @access  Private
const rateRecipe = async (req, res) => {
  const { stars } = req.body;

  try {
    const recipe = await Recipe.findById(req.params.id);

    if (recipe) {
      const alreadyRated = recipe.ratings.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyRated) {
        return res.status(400).json({ message: 'Recipe already rated' });
      }

      const rating = {
        user: req.user._id,
        stars: Number(stars),
      };

      recipe.ratings.push(rating);
      recipe.calculateAverageRating(); // Call the schema method

      await recipe.save();
      res.status(201).json({ message: 'Rating added' });
    } else {
      res.status(404).json({ message: 'Recipe not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  rateRecipe
};