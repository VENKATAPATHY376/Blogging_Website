import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import authRoutes from './src/routes/authroutes.js';
import postRoutes from './src/routes/postRoutes.js';
import commentRoutes from './src/routes/commentroutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import monetizationRoutes from './src/routes/monetizationRoutes.js';
import schedulerService from './src/services/schedulerService.js';

dotenv.config();

console.log('Starting server...');

// The HTTP server starts immediately; MongoDB connects in the background.
const app = express();
app.use(express.json());

// Configure CORS properly for development and production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Origins are case-insensitive and may include a trailing slash.
    const normalize = (value) => value.trim().toLowerCase().replace(/\/$/, '');
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'https://blogeweb.netlify.app',
      'https://venkatapathy376.github.io',
      process.env.CORS_ORIGIN,
      ...(process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean)
    ].filter(Boolean).map(normalize);

    const normalizedOrigin = normalize(origin);

    let hostname = '';
    try {
      hostname = new URL(normalizedOrigin).hostname;
    } catch {
      return callback(new Error('Not allowed by CORS'));
    }

    const isAllowed =
      allowedOrigins.includes(normalizedOrigin) ||
      hostname === 'venkatapathy376.github.io' ||
      hostname.endsWith('.netlify.app') ||
      hostname.endsWith('.onrender.com');

    if (isAllowed || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

app.use(cors(corsOptions));

// Serve frontend static files (single-folder frontend)
import path from 'path';
import { fileURLToPath } from 'url';
// compute __dirname reliably in ESM regardless of current working directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Health check for Render / uptime monitoring
app.get('/api/health', (req, res) => {
  const states = ['DISCONNECTED', 'CONNECTED', 'CONNECTING', 'DISCONNECTING'];
  res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({
    status: mongoose.connection.readyState === 1 ? 'ok' : 'unavailable',
    database: states[mongoose.connection.readyState] || 'UNKNOWN',
    dbName: mongoose.connection.name || null
  });
});

// Do not let DB-dependent routes run while MongoDB is unavailable.
// This prevents Mongoose buffering timeouts and unhandled rejections.
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database unavailable',
      database: 'DISCONNECTED'
    });
  }
  next();
});

// Routes
app.use('/api', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/monetization', monetizationRoutes);

const PORT = process.env.PORT || 4000;

// serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API routes
app.use('/api/uploads', uploadRoutes);

// SPA fallback: send index.html for unhandled GET requests (so client-side routing works)
app.get('*', (req, res, next) => {
	if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
	res.sendFile(path.join(frontendPath, 'index.html'));
});

// express error handler
app.use((err, req, res, next) => {
	console.error('Request error:', err.message);
	if (err.message === 'Not allowed by CORS') {
		return res.status(403).json({ message: 'Origin not allowed by CORS' });
	}
	res.status(500).json({ message: 'Internal server error' });
});

// Bind the port immediately so Render can detect the service, then connect to MongoDB.
const server = app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
	console.error('Server error:', err.message);
	process.exit(1);
});

const start = async () => {
	try {
		console.log('Connecting to database...');
		await connectDB();
		console.log('Database connected');

		// Initialize scheduler service
		try {
			console.log('Initializing smart scheduling service...');
			schedulerService.init();
			console.log('Smart scheduling service initialized');
		} catch (schedulerError) {
			console.warn('Warning: Failed to initialize scheduler service:', schedulerError.message);
			console.log('Server will continue without smart scheduling feature');
		}
	} catch (err) {
		// Do not exit: the port stays open so Render keeps the service alive.
		// /api/health will report the DB as unavailable until it is fixed.
		console.error('Database connection failed:', err.message);
		console.warn('Server is running, but database-backed routes will fail until MongoDB is reachable.');
	}
};

const shutdown = (signal) => {
	console.log(`\nReceived ${signal}. Shutting down gracefully...`);
	try {
		schedulerService.stop();
	} catch (err) {
		console.warn('Could not stop scheduler:', err.message);
	}
	server.close(() => {
		console.log('Server closed');
		process.exit(0);
	});
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Safety net: an async route that misses a catch should not crash the service.
process.on('unhandledRejection', (reason) => {
	console.error('Unhandled promise rejection:', reason?.message || reason);
});

start();
