const express = require('express');
import { registerUser, loginUser } from '../controllers/userController';

const router = express.Router();
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;