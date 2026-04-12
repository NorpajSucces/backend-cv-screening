// Entry point
const { setServers } = require('node:dns');
setServers(['1.1.1.1', '8.8.8.8']);

require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const connectDB = require('./config/db');
const mongoose = require("mongoose");
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();

// Load Swagger Document
const swaggerDocument = YAML.load(path.join(__dirname, './docs/swagger.yaml'));

// Connect Database
connectDB();

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// Routes
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/jobs',       require('./routes/publicJobRoutes'));
app.use('/api/candidates', require('./routes/candidateRoutes'));
app.use('/api/dashboard',  require('./routes/dashboardRoutes'));
app.use('/api/hr/jobs',    require('./routes/hrJobRoutes'));

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'SmartRecruit API is running' });
});

// Error Handler (must be last)
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});