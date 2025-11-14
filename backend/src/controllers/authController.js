import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // basic validation
    if (!username || !email || !password) return res.status(400).json({ message: 'username, email and password are required' });

    // prevent duplicate username/email
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      if (existing.username === username) return res.status(400).json({ message: 'Username already taken' });
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashed });
    await user.save();
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '2d' });
    const safeUser = { _id: user._id, id: user._id, username: user.username, email: user.email, displayName: user.username };
    res.json({ accessToken: token, user: safeUser });
  } catch (err) {
    console.error('Register error:', err);
    // handle duplicate key error defensively
    if (err.code === 11000) return res.status(400).json({ message: 'Duplicate key error' });
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '2d' });
    const safeUser = { _id: user._id, id: user._id, username: user.username, email: user.email, displayName: user.username };
    res.json({ accessToken: token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
