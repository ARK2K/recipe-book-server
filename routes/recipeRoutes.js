const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  createRecipe,
  getMyRecipes,
  getSharedRecipes,
  searchRecipes,
  updateRecipe,
  deleteRecipe,
  rateRecipe,
  shareRecipe,
  getRecipeById
} = require('../controllers/recipeController');

router.post('/', auth, createRecipe);
router.get('/mine', auth, getMyRecipes);
router.get('/shared', auth, getSharedRecipes);
router.get('/search', auth, searchRecipes);
router.get('/:id', auth, getRecipeById);
router.put('/:id', auth, updateRecipe);
router.delete('/:id', auth, deleteRecipe);
router.post('/:id/rate', auth, rateRecipe);
router.post('/:id/share', auth, shareRecipe);

module.exports = router;