const express = require('express');
const { check } = require('express-validator');
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

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

module.exports = router;