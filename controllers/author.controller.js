const Author = require('../models/author.model');

exports.getRecommendedAuthors = async (req, res) => {
  try {
    const authors = await Author.find().sort({ totalViews: -1 }).limit(10);
    res.json(authors);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server khi lấy tác giả đề xuất' });
  }
};

// API tạo tác giả mới
exports.createAuthor = async (req, res) => {
  const { name, bio, image } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Tên tác giả là bắt buộc' });
  }

  try {
    const newAuthor = new Author({
      name,
      bio,
      image,
      totalViews:0, // Default to 0 nếu không có giá trị
    });

    await newAuthor.save();
    res.status(201).json({ message: 'Tác giả đã được tạo thành công', newAuthor });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server khi tạo tác giả' });
  }
};

// API sửa thông tin tác giả
exports.updateAuthor = async (req, res) => {
  const authorId = req.params.id;
  const { name, bio, image, totalViews } = req.body;

  try {
    const author = await Author.findById(authorId);
    if (!author) return res.status(404).json({ message: 'Tác giả không tồn tại' });

    if (name) author.name = name;
    if (bio) author.bio = bio;
    if (image) author.image = image;
    if (totalViews !== undefined) author.totalViews = totalViews;

    await author.save();
    res.json({ message: 'Tác giả đã được cập nhật thành công', author });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server khi cập nhật tác giả' });
  }
};

// API xóa tác giả
exports.deleteAuthor = async (req, res) => {
  const authorId = req.params.id;

  try {
    const author = await Author.findByIdAndDelete(authorId);
    if (!author) return res.status(404).json({ message: 'Tác giả không tồn tại' });

    res.json({ message: 'Tác giả đã bị xóa thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server khi xóa tác giả' });
  }
};


