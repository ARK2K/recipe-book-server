const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

const sendRefreshToken = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const user = await User.create({ name, email, password });

  if (!user) return res.status(400).json({ message: 'Invalid user data' });

  const token = generateToken(user._id);
  const refresh = generateRefreshToken(user._id);
  sendRefreshToken(res, refresh);

  res.status(201).json({ _id: user._id, name: user.name, email: user.email, token });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && await user.matchPassword(password)) {
    const token = generateToken(user._id);
    const refresh = generateRefreshToken(user._id);
    sendRefreshToken(res, refresh);

    res.json({ _id: user._id, name: user.name, email: user.email, token });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

const refreshToken = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const newToken = generateToken(decoded.id);
    res.json({ token: newToken });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out' });
};

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
};