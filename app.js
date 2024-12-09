const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');
require('./config/database'); // Ensure database is initialized

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Error Handling Middleware
app.use(errorMiddleware);

module.exports = { app };