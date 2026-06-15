require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const rateLimit = require('express-rate-limit');

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] }
});
app.set('io', io);

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(passport.initialize());

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

// Passport config
require('./config/passport');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/assessment', require('./routes/assessment'));
app.use('/api/roadmap', require('./routes/roadmap'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/interview', require('./routes/interview'));
app.use('/api/english', require('./routes/english'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/community', require('./routes/community'));
app.use('/api/badges', require('./routes/badges'));
app.use('/api/todos', require('./routes/todos'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/livekit', require('./routes/livekit'));
app.use('/api/judge0', require('./routes/judge0'));
app.use('/api/pdf', require('./routes/pdf'));
app.use('/api/analytics', require('./routes/analytics'));

// Socket handlers
require('./sockets/chat')(io);
require('./sockets/interview')(io);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server Error' });
});

// DB + Server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    server.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => { console.error('❌ DB Error:', err); process.exit(1); });

module.exports = app;
