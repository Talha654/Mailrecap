const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/apiRoutes');
const ttsRoutes = require('./routes/ttsRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', apiRoutes);
app.use('/api/tts', ttsRoutes);

module.exports = app;
