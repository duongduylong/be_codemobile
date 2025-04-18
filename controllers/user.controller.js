// controllers/user.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, 'secretKey', { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getUserHistory = async (req, res) => {
    try {
      const userId = req.user.id; // lấy từ middleware auth
      const statusQuery = req.query.status; // đọc query status
  
      const user = await User.findById(userId).populate('readHistory.bookId readHistory.chapterId');
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      let history;
      if (statusQuery === 'reading' || statusQuery === 'finished') {
        history = user.readHistory.filter(h => h.status === statusQuery);
      } else {
        history = user.readHistory;
      }
  
      res.json({ history });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
};
  

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
