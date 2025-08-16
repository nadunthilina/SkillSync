const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();

// Config
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ message: 'OK' });
});
app.use('/api/auth', authRoutes);

// DB + Server start
async function start() {
  let connected = false;
  try {
    if (!MONGO_URI) {
      console.warn('MONGO_URI is not set. Skipping DB connection for now.');
    } else {
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
      console.log('MongoDB connected');
      connected = true;
    }
  } catch (err) {
    console.warn('MongoDB connection failed:', err?.message || err);
  } finally {
    app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}${connected ? '' : ' (DB not connected)'}`));
  }
}

start();
