const express = require('express');
const { generateRecipe, autoTagRecipe } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware'); // reuse JWT auth

const router = express.Router();

router.post('/generate-recipe', protect, generateRecipe);
router.post('/auto-tag', protect, autoTagRecipe);

module.exports = router;