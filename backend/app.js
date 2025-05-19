const express = require('express');
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

const routes = require('./routes');
app.use('/api', routes);