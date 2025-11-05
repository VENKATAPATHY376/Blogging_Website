import express from 'express';
import multer from 'multer';
import { uploadFile } from '../controllers/uploadController.js';
import path from 'path';

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'uploads');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  }
});

const upload = multer({ storage });

router.post('/', upload.single('file'), uploadFile);

export default router;
