const express = require('express');
const {
  createRecipe,
  getRecipes,
  getRecipeById,
  getUserRecipes,
  updateRecipe,
  deleteRecipe,
  uploadImage
} = require('../controllers/recipeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/upload', protect, uploadImage);

router.get('/', getRecipes);
router.get('/:id', getRecipeById);

router.post('/', protect, createRecipe);
router.get('/my-recipes', protect, getUserRecipes);
router.put('/:id', protect, updateRecipe);
router.delete('/:id', protect, deleteRecipe);

module.exports = router;