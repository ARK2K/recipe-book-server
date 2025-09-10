const express = require('express');
const { generateRecipe, autoTagRecipe, generateGroceryList } = require('../controllers/aiController');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

const router = express.Router();

router.post('/generate-recipe', ClerkExpressRequireAuth(), generateRecipe);
router.post('/auto-tag', ClerkExpressRequireAuth(), autoTagRecipe);
router.post('/grocery-list', ClerkExpressRequireAuth(), generateGroceryList);

module.exports = router;