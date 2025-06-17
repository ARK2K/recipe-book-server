const express = require('express');
const {
  createRecipe,
  getRecipes,
  getRecipeById,
  getUserRecipes,
  getFavoriteRecipes,
  updateRecipe,
  deleteRecipe,
  uploadImage,
  toggleLike,
  rateRecipe,
  addComment
} = require('../controllers/recipeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/upload', protect, uploadImage);
router.get('/my-recipes', protect, getUserRecipes);
router.get('/favorites', protect, getFavoriteRecipes);
router.get('/', getRecipes);
router.post('/', protect, createRecipe);
router.get('/:id', getRecipeById);
router.put('/:id', protect, updateRecipe);
router.delete('/:id', protect, deleteRecipe);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/rate', protect, rateRecipe);
router.post('/:id/comment', protect, addComment);

module.exports = router;