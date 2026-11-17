const express = require('express');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 8000;

app.use('/users', userRoutes);

app.listen(PORT, () => console.log(`server started on port ${PORT}`));
