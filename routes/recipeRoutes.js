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
  addComment,
  toggleFavoriteRecipe,
} = require('../controllers/recipeController');

const router = express.Router();

router.post('/upload', uploadImage);
router.get('/my-recipes', getUserRecipes);
router.get('/favorites', getFavoriteRecipes);
router.get('/', getRecipes);
router.post('/', createRecipe);
router.get('/:id', getRecipeById);
router.put('/:id', updateRecipe);
router.delete('/:id', deleteRecipe);
router.post('/:id/like', toggleLike);
router.post('/:id/rate', rateRecipe);
router.post('/:id/comment', addComment);
router.post('/favorites/:id', toggleFavoriteRecipe);

module.exports = router;