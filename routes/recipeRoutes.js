const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  rateRecipe
} = require('../controllers/recipeController');
const { check } = require('express-validator');
const multer = require('multer'); // For image uploads

const router = express.Router();

// Multer storage for in-memory buffer (to send to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router
  .route('/')
  .post(
    protect,
    upload.single('image'), // 'image' is the field name for the file
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('ingredients', 'Ingredients are required').not().isEmpty(),
      check('instructions', 'Instructions are required').not().isEmpty(),
    ],
    createRecipe
  )
  .get(getRecipes);

router
  .route('/:id')
  .get(getRecipeById)
  .put(
    protect,
    upload.single('image'),
    [
      check('title', 'Title is required').optional().not().isEmpty(),
      check('description', 'Description is required').optional().not().isEmpty(),
      check('ingredients', 'Ingredients are required').optional().not().isEmpty(),
      check('instructions', 'Instructions are required').optional().not().isEmpty(),
    ],
    updateRecipe
  )
  .delete(protect, deleteRecipe);

router.route('/:id/rate').post(protect, rateRecipe);


module.exports = router;