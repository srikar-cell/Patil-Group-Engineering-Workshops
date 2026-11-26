const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./migrate');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/task');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Server is running'
    });
});

// Routes
app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);
app.use('/api/tasks', taskRoutes);

// Initialize database and start server
async function startServer() {
    try {
        await initDatabase();
    } catch (error) {
        console.error("Database initialization warning:", error.message);
    }

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();
