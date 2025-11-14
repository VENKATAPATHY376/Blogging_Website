import Post from '../models/postModel.js';
import Comment from '../models/commentModel.js';

export const createPost = async (req, res) => {
  const post = new Post({ ...req.body, author: req.user.id });
  await post.save();
  res.json(post);
};

export const getPosts = async (req, res) => {
  const { q, page = 1, limit = 8 } = req.query;
  const filter = q ? { $or: [ { title: new RegExp(q, 'i') }, { content: new RegExp(q, 'i') } ] } : {};
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, parseInt(limit, 10) || 8);
  const total = await Post.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / l));
  const items = await Post.find(filter).populate('author', 'username').sort({ createdAt: -1 }).skip((p-1)*l).limit(l);
  res.json({ items, page: p, totalPages, total });
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username email');
    if(!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const commentsRaw = await Comment.find({ postId: req.params.id }).populate('userId', 'username').sort({ createdAt: -1 });
    const comments = commentsRaw.map(c => ({ 
      _id: c._id, 
      content: c.content, 
      createdAt: c.createdAt, 
      author: { 
        username: c.userId?.username,
        _id: c.userId?._id
      } 
    }));

    res.json({ post, comments });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const likePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  if (post.likes.includes(req.user.id)) post.likes.pull(req.user.id);
  else {
    post.likes.push(req.user.id);
    post.dislikes.pull(req.user.id);
  }
  await post.save();
  res.json(post);
};

export const dislikePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  if (post.dislikes.includes(req.user.id)) post.dislikes.pull(req.user.id);
  else {
    post.dislikes.push(req.user.id);
    post.likes.pull(req.user.id);
  }
  await post.save();
  res.json(post);
};

export const updatePost = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const post = await Post.findById(req.params.id).populate('author', 'username email');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const postAuthorId = post.author._id.toString();
    const currentUserId = req.user.id.toString();

    if (postAuthorId !== currentUserId) {
      return res.status(403).json({ 
        message: 'You can only edit your own posts',
        postAuthor: post.author.username,
        currentUser: req.user.username
      });
    }

    const { title, content, tags } = req.body;
    
    if (title !== undefined) {
      post.title = title;
    }
    
    if (content !== undefined) {
      post.content = content;
    }
    
    if (tags !== undefined) {
      post.tags = tags;
    }

    post.markModified('title');
    post.markModified('content');
    post.markModified('tags');
    
    const savedPost = await post.save({ validateBeforeSave: true });
    await savedPost.populate('author', 'username');
    
    res.json(savedPost);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deletePost = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const post = await Post.findById(req.params.id).populate('author', 'username email');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const postAuthorId = post.author._id.toString();
    const currentUserId = req.user.id.toString();

    if (postAuthorId !== currentUserId) {
      return res.status(403).json({ 
        message: 'You can only delete your own posts',
        postAuthor: post.author.username,
        currentUser: req.user.username
      });
    }

    const commentDeleteResult = await Comment.deleteMany({ postId: req.params.id });
    await Post.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: 'Post deleted successfully',
      deletedPost: {
        id: post._id,
        title: post.title
      },
      deletedComments: commentDeleteResult.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTags = async (req, res) => {
  const tags = await Post.distinct('tags');
  res.json(tags);
};
