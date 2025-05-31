const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email }))
    return res.status(400).json({ message: 'Email already exists' });

  const user = await User.create({ name, email, password });
  res.status(201).json({
    token: generateToken(user._id),
    user: { id: user._id, name: user.name, email: user.email },
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};

module.exports = { registerUser, loginUser };