const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // <--- ADD THIS LINE: Import bcryptjs

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const registerUser = async (req, res) => {
  try { // <--- ADD try...catch block
    const { name, email, password } = req.body;

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already exists' });

    // User.create() will trigger the pre('save') hook in User.js which uses bcrypt
    const user = await User.create({ name, email, password });

    res.status(201).json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Registration error in userController:', error); // Log the error on the server
    res.status(500).json({ message: 'Server error during registration. Please try again.' }); // Send a 500 status
  }
};

const loginUser = async (req, res) => {
  try { // <--- ADD try...catch block
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // user.matchPassword also uses bcrypt internally
    if (user && (await user.matchPassword(password))) {
      res.json({
        token: generateToken(user._id),
        user: { id: user._id, name: user.name, email: user.email },
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error in userController:', error); // Log the error on the server
    res.status(500).json({ message: 'Server error during login. Please try again.' }); // Send a 500 status
  }
};

module.exports = { registerUser, loginUser };