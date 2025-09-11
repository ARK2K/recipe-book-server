require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./middleware/errorMiddleware');
const { protect } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin like Postman or curl
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Import routes
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const healthRoutes = require('./routes/healthRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Public health check route
app.get('/', (req, res) => {
  res.json({ message: 'API running' });
});

// Use JWT protect middleware to secure routes
app.use('/api/users', protect, authRoutes);
app.use('/api/recipes', protect, recipeRoutes);

app.use('/api/ai', aiRoutes);

// Public API routes
app.use('/api', healthRoutes);

// Error Handler Middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});