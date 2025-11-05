import express from 'express';
import { addComment, getComments } from '../controllers/commentController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post('/', authMiddleware, addComment);
router.get('/', getComments);

export default router;
