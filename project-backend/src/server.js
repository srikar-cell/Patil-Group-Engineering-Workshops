const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/task');

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS for all incoming requests (must be placed before routes)
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);
app.use('/api/tasks', taskRoutes);


app.listen(PORT, () => console.log(`server started on port ${PORT}`));
