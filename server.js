require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Body parser for JSON

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/recipes', require('./routes/recipeRoutes'));
// Add other routes as you implement them

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Recipe Book API is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});