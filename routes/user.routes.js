// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/user.model');
// const auth = require('../middlewares/auth');

// // Register
// router.post('/register', async (req, res) => {
//   const { username, email, password } = req.body;
//   const existingUser = await User.findOne({ email });
//   if (existingUser) return res.status(400).json({ message: 'Email already exists' });

//   const hashedPassword = await bcrypt.hash(password, 10);
//   const user = new User({ username, email, password: hashedPassword });
//   await user.save();
//   res.json({ message: 'User registered successfully' });
// });

// // Login
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email });
//   if (!user) return res.status(400).json({ message: 'Invalid credentials' });

//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

//   const token = jwt.sign({ id: user._id }, 'secretKey', { expiresIn: '7d' });
//   res.json({ token, user });
// });

// // Get user history
// router.get('/:id/history', async (req, res) => {
//   const user = await User.findById(req.params.id).populate('readHistory.bookId readHistory.chapterId');
//   const finished = user.readHistory.filter(h => h.status === 'finished');
//   const reading = user.readHistory.filter(h => h.status === 'reading');
//   res.json({ finished, reading });
// });

// router.get('/profile', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-password'); // ẩn password
//     if (!user) return res.status(404).json({ message: 'User not found' });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;
// routes/user.route.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const auth = require("../middlewares/auth");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/history", auth, userController.getUserHistory);
router.get("/profile", auth, userController.getProfile);
router.put("/update", auth, userController.updateInfo);
router.put("/update-password", auth, userController.updatePassword);
router.get("/", userController.getUsers);
router.get("/listHistory", userController.getListHistory);
module.exports = router;

