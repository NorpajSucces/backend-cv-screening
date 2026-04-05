// entry point, semua disatukan
const { setServers } = require('node:dns');
setServers(['1.1.1.1', '8.8.8.8']);

require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const connectDB = require('./config/db');
const mongoose = require("mongoose");

const jobRoutes = require("./routes/jobRoutes");
const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/jobs',       require('./routes/publicJobRoutes'));
app.use('/api/candidates', require('./routes/candidateRoutes'));
app.use('/api/dashboard',  require('./routes/dashboardRoutes'));
app.use('/api/hr/jobs',    require('./routes/hrJobRoutes'));
app.use("/api", jobRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'SmartRecruit API is running' });
});

// Error Handler (harus paling bawah)
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//jobRoutes
.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

app.listen(3000, () => console.log("Server running on port 3000"));

// Middleware dasar
app.use(express.json());

// Routes
app.use("/api", jobRoutes);

// Koneksi MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Global error handler
app.user((err, req, res, next) => {
  if (err.message === "Only PDF files are allowed") {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File too large (max 2 MB)" });
  }
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});
app.listen(3000, () => console.log("Server running on port 3000"));