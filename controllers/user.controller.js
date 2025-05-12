// controllers/user.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Email đã tồn tại' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.json({ message: 'Đăng kí tài khoản thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Sai thông tin đăng nhập' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Sai thông tin đăng nhập' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_secret, { expiresIn: '7d' });
    res.json({ token});
  } catch (err) {
    res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
  }
};

exports.getUserHistory = async (req, res) => {
    try {
      const userId = req.user.id; // lấy từ middleware auth
      const statusQuery = req.query.status; // đọc query status
  
      // const user = await User.findById(userId).populate('readHistory.bookId readHistory.chapterId  readHistory.bookId.author');
      const user = await User.findById(userId)
      .populate({
        path: 'readHistory.bookId', // Populate thông tin sách
        populate: { path: 'author', select: 'name bio image' } // Populate thông tin tác giả trong sách
      })
      .populate('readHistory.chapterId'); // Nếu có chapterId, bạn cũng có thể populate nó
      if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
  
      let history;
      if (statusQuery === 'reading' || statusQuery === 'finished') {
        history = user.readHistory.filter(h => h.status === statusQuery);
      } else {
        history = user.readHistory;
      }
  
      res.json({ history });
    } catch (err) {
      res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
    }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Có lỗi xảy ra', error: err.message });
  }
};
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    if (!users) return res.status(404).json({ message: 'User not found' });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
