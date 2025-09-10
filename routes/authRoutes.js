const express = require('express');
const { getUserProfile, toggleFavorite } = require('../controllers/authController');
const router = express.Router();

router.get('/profile', getUserProfile);
router.get('/me', getUserProfile);
router.post('/favorites/:id', toggleFavorite);

module.exports = router;