// controllers/user.controller.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email đã tồn tại" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.json({ message: "Đăng kí tài khoản thành công" });
  } catch (err) {
    res.status(500).json({ message: "Có lỗi xảy ra", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Sai thông tin đăng nhập" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Sai thông tin đăng nhập" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_secret, {
      expiresIn: "7d",
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Có lỗi xảy ra", error: err.message });
  }
};

exports.getUserHistory = async (req, res) => {
  try {
    const userId = req.user.id; // lấy từ middleware auth
    const statusQuery = req.query.status; // đọc query status

    // const user = await User.findById(userId).populate('readHistory.bookId readHistory.chapterId  readHistory.bookId.author');
    const user = await User.findById(userId)
      .populate({
        path: "readHistory.bookId", // Populate thông tin sách
        populate: { path: "author", select: "name bio image" }, // Populate thông tin tác giả trong sách
      })
      .populate("readHistory.chapterId"); // Nếu có chapterId, bạn cũng có thể populate nó
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    let history;
    if (statusQuery === "reading" || statusQuery === "finished") {
      history = user.readHistory.filter((h) => h.status === statusQuery);
    } else {
      history = user.readHistory;
    }

    res.json({ history });
  } catch (err) {
    res.status(500).json({ message: "Có lỗi xảy ra", error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Có lỗi xảy ra", error: err.message });
  }
};
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    if (!users) return res.status(404).json({ message: "Không tìm thấy user" });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Có lỗi xảy ra", error: err.message });
  }
};

exports.getListHistory = async (req, res) => {
  try {
    const users = await User.find({}).lean();

    const finishedReadHistory = [];

    users.forEach((user) => {
      if (user.readHistory && user.readHistory.length > 0) {
        user.readHistory.forEach((history) => {
          if (history.status === "finished") {
            finishedReadHistory.push({
              userId: user._id,
              bookId: history.bookId,
              readAt: history.readAt,
            });
          }
        });
      }
    });

    res.status(200).json(finishedReadHistory);
  } catch (error) {
    console.error("Error getting read history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateInfo = async (req, res) => {
  try {
    const { newUsername } = req.body;
    const users = await User.find({ username: newUsername }).lean();
    if (users.length) {
      res.status(409).json({ message: "Tên đã tồn tại" });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { username: newUsername },
      { new: true, select: "-password" },
    );

    res.status(200).json({
      data: updatedUser,
      message: "Cập nhật thành công",
    });
    return;
  } catch (err) {
    res.status(500).json({
      message: "Có lỗi xảy ra",
    });
  }
};

exports.updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user)
      return res
        .status(400)
        .json({ message: "Có lỗi xảy ra, vui lòng đăng nhập lại" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({
        message: "Mật khẩu cũ không chính xác",
        fieldKey: "old_password",
      });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updated = await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });
    res.status(200).json({ message: "Cập nhật thành công" });
  } catch (err) {
    res.status(500).json({ message: "Có lỗi xảy ra", error: err.message });
  }
};
