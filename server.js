const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
import connectDB from './config/db';
import recipeRoutes from './routes/recipeRoutes';
import userRoutes from './routes/userRoutes';
import { notFound, errorHandler } from './middleware/errorMiddleware';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/ping', (req, res) => res.send('Pong!'));

app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));