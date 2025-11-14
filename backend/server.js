import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './src/routes/authroutes.js';
import postRoutes from './src/routes/postRoutes.js';
import commentRoutes from './src/routes/commentroutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';

dotenv.config();

console.log('Starting server...');

// connectDB returns a promise; start the server only after DB connected
const app = express();
app.use(express.json());

// Configure CORS properly for development and production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Define allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'https://blogeweb.netlify.app'
    ];
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
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

// Routes
app.use('/api', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

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
	res.status(500).json({ message: 'Internal server error' });
});

// start the server after DB connection is established
const start = async () => {
	try {
		console.log('Connecting to database...');
		await connectDB();
		console.log('Database connected');
		
		const server = app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
		
		server.on('error', (err) => {
			console.error('Server error:', err.message);
			process.exit(1);
		});
	} catch (err) {
		console.error('Failed to start:', err.message);
		process.exit(1);
	}
};

start();
