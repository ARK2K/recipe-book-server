const express = require('express');
const { check } = require('express-validator');
const {
  registerUser,
  loginUser,
  getUserProfile,
  refreshToken,
  logoutUser,
  toggleFavorite
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { getFavoriteRecipes } = require('../controllers/recipeController');
const router = express.Router();

router.post(
  '/register',
  [
    check('name').not().isEmpty(),
    check('email').isEmail(),
    check('password').isLength({ min: 6 }),
  ],
  registerUser
);

router.post(
  '/login',
  [
    check('email').isEmail(),
    check('password').exists(),
  ],
  loginUser
);

router.get('/profile', protect, getUserProfile);
router.get('/me', protect, getUserProfile);
router.get('/refresh', refreshToken);
router.get('/logout', logoutUser);
router.get('/favorites', protect, getFavoriteRecipes);
router.post('/favorites/:id', protect, toggleFavorite);

module.exports = router;