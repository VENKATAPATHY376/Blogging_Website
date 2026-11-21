import express from 'express';
import multer from 'multer';
import { uploadFile } from '../controllers/uploadController.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Created uploads directory:', uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('📤 Upload destination:', uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = unique + ext;
    console.log('📸 Generated filename:', filename);
    cb(null, filename);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  console.log('🔍 Checking file type:', file.mimetype);
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
  console.error('❌ Upload error:', err.message);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ message: 'Upload error: ' + err.message });
  }
  if (err.message === 'Only image files are allowed!') {
    return res.status(400).json({ message: err.message });
  }
  next(err);
};

router.post('/', upload.single('file'), handleUploadError, uploadFile);

export default router;
