import express from 'express';
import {
  createPost, getPosts, getPostById,
  likePost, dislikePost, getTags, updatePost, deletePost
} from '../controllers/postController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createPost);
router.get('/', getPosts);
// place static routes before dynamic :id route to avoid conflicts
router.get('/tags/all', getTags);
router.get('/:id', getPostById);

router.put('/:id', authMiddleware, updatePost);

router.delete('/:id', authMiddleware, deletePost);
router.post('/:id/like', authMiddleware, likePost);
router.post('/:id/dislike', authMiddleware, dislikePost);

export default router;
