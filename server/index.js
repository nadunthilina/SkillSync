const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const analyzerRoutes = require('./routes/analyzer');
const roadmapRoutes = require('./routes/roadmap');
const mentorsRoutes = require('./routes/mentors');
const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const auth = require('./middleware/auth');
const { verifyAdmin } = require('./middleware/auth');

dotenv.config();

const app = express();

// Config
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middleware
// CORS: allow configured origins; in dev, allow any localhost port for convenience
const allowedOrigins = (CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow non-browser requests or same-origin
      if (!origin) return callback(null, true);

      // If explicit list provided, honor it
      if (allowedOrigins.length > 0) {
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
      }

      // Fallback: allow any localhost:* for dev
      if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ message: 'OK' });
});
app.use('/api/auth', authRoutes);
app.use('/api/analyzer', analyzerRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/mentors', mentorsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', auth(true), verifyAdmin, adminRoutes);

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
