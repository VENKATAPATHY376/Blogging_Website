import Comment from '../models/commentModel.js';

export const addComment = async (req, res) => {
  const postId = req.body.post || req.body.postId;
  if (!postId) return res.status(400).json({ message: 'post id required' });
  const comment = new Comment({ postId, content: req.body.content, userId: req.user.id });
  await comment.save();
  await comment.populate('userId', 'username');
  const out = { _id: comment._id, content: comment.content, createdAt: comment.createdAt, author: { username: comment.userId.username } };
  res.json(out);
};

export const getComments = async (req, res) => {
  const postId = req.query.post;
  if (!postId) return res.status(400).json({ items: [] });
  const comments = await Comment.find({ postId }).populate('userId', 'username').sort({ createdAt: -1 });
  const items = comments.map(c => ({ _id: c._id, content: c.content, createdAt: c.createdAt, author: { username: c.userId?.username } }));
  res.json({ items });
};
