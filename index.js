require('dotenv').config();
const express = require('express');
const connectDB = require('/config/db');
const jobRoutes = require('./routes/jobRoutes');

const app = express();
connectDB();

app.use(express.json());
app.user('/api/jobs', jobRoutes)