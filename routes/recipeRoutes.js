const express = require('express');
const {
  createRecipe,
  getRecipes,
  getRecipeById,
  getUserRecipes,
  updateRecipe,
  deleteRecipe,
  uploadImage,
  upload
} = require('../controllers/recipeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getRecipes);
router.post('/', protect, createRecipe);
router.get('/my-recipes', protect, getUserRecipes);
router.get('/:id', getRecipeById);
router.put('/:id', protect, updateRecipe);
router.delete('/:id', protect, deleteRecipe);
router.post('/upload', protect, upload.single('image'), uploadImage);

module.exports = router;