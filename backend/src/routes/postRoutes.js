import express from 'express';
import {
  createPost, getPosts, getPostById,
  likePost, dislikePost, getTags, updatePost, deletePost,
  createSmartScheduledPost, getScheduledPosts, cancelScheduledPost, reschedulePost
} from '../controllers/postController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createPost);
router.get('/', getPosts);
router.get('/tags/all', getTags);

router.post('/schedule', authMiddleware, createSmartScheduledPost);
router.get('/scheduled/all', authMiddleware, getScheduledPosts);
router.post('/:id/cancel-schedule', authMiddleware, cancelScheduledPost);
router.put('/:id/reschedule', authMiddleware, reschedulePost);

router.get('/:id', getPostById);

router.put('/:id', authMiddleware, updatePost);

router.delete('/:id', authMiddleware, deletePost);
router.post('/:id/like', authMiddleware, likePost);
router.post('/:id/dislike', authMiddleware, dislikePost);

export default router;
