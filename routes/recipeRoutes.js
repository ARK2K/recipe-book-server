import express from 'express';
import {
  getRecipes, getRecipeById, createRecipe,
  updateRecipe, deleteRecipe,
} from '../controllers/recipeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getRecipes)
  .post(protect, createRecipe);

router.route('/:id')
  .get(getRecipeById)
  .put(protect, updateRecipe)
  .delete(protect, deleteRecipe);

export default router;