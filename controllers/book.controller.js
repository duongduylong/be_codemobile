const Book = require('../models/book.model');
const Author = require('../models/author.model');
// Get all books
exports.getAllBooks = async (req, res) => {
  const books = await Book.find()
        .select('_id title author genres description coverImage rating views')
        .populate('author');
  res.json(books);
};

// Add new book
exports.addBook = async (req, res) => {
  try {
    const { title, author, genres, description, coverImage } = req.body;

    const newBook = new Book({
      title,
      author,
      genres,
      description,
      coverImage,
      rating: 0,
      views: 0,
      reviews: []
    });

    await newBook.save();
    res.status(201).json({ message: 'Book added successfully', book: newBook });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while adding book' });
  }
};

// Update book
exports.updateBook = async (req, res) => {
  try {
    const { title, author, genres, description, coverImage, views, rating } = req.body;
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author, genres, description, coverImage, views, rating },
      { new: true }
    );

    if (!updatedBook) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book updated successfully', book: updatedBook });
  } catch (err) {
    res.status(500).json({ message: 'Error updating book', error: err.message });
  }
};

// Delete book
exports.deleteBook = async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting book', error: err.message });
  }
};

// Search books
// exports.searchBooks = async (req, res) => {
//   const { q } = req.query;
//   const books = await Book.find({
//     $or: [
//       { title: new RegExp(q, 'i') },
//       { author: new RegExp(q, 'i') },
//       { genres: new RegExp(q, 'i') },
//     ],
//   });
//   res.json(books);
// };
exports.searchBooks = async (req, res) => {
  const { q } = req.query;

  // Tìm tất cả các tác giả có tên trùng với từ khóa tìm kiếm
  const authors = await Author.find({
    name: new RegExp(q, 'i') // Tìm kiếm tác giả theo tên (không phân biệt chữ hoa, chữ thường)
  }).select('_id'); // Chỉ lấy _id của tác giả

  // Nếu tìm thấy tác giả, thực hiện tìm kiếm sách theo tên tác giả hoặc ID tác giả
  const books = await Book.find({
    $or: [
      { title: new RegExp(q, 'i') },  // Tìm theo tiêu đề sách
      { genres: new RegExp(q, 'i') },  // Tìm theo thể loại sách
      { author: { $in: authors.map(author => author._id) } }  // Tìm theo ID tác giả (nếu có)
    ],
  });

  res.json(books);
};

// Get book detail
exports.getBookDetail = async (req, res) => {
  const book = await Book.findById(req.params.id).populate('author');
  await book.save(); // nếu cần cập nhật views có thể thêm logic
  res.json(book);
};

// Top rated books
exports.getTopRatedBooks = async (req, res) => {
  const books = await Book.find().sort({ rating: -1, views: -1 }).limit(10);
  res.json(books);
};

// Top books by period
exports.getTopBooksByPeriod = async (req, res) => {
  const { period = 'day' } = req.query;
  const now = new Date();
  let currentPeriodKey = '';
  let shouldReset = (lastDate) => true;

  switch (period) {
    case 'week':
      currentPeriodKey = 'week';
      shouldReset = (lastDate) => {
        const start = new Date(now);
        const day = start.getDay();
        const diff = (day === 0 ? -6 : 1 - day);
        start.setDate(start.getDate() + diff);
        start.setHours(0, 0, 0, 0);
        return !lastDate || new Date(lastDate) < start;
      };
      break;
    case 'month':
      currentPeriodKey = 'month';
      shouldReset = (lastDate) => {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return !lastDate || new Date(lastDate) < start;
      };
      break;
    default:
      currentPeriodKey = 'day';
      shouldReset = (lastDate) => {
        const start = new Date(now.setHours(0, 0, 0, 0));
        return !lastDate || new Date(lastDate) < start;
      };
      break;
  }

  try {
    const books = await Book.find().populate('author');

    for (const book of books) {
      const lastUpdate = book.lastStatsUpdate?.[currentPeriodKey];
      if (shouldReset(lastUpdate)) {
        book.viewStats[currentPeriodKey] = 0;
        book.reviewStats[currentPeriodKey] = 0;
        book.lastStatsUpdate[currentPeriodKey] = new Date();
        await book.save();
      }
    }

    const totalRatings = books.reduce((sum, b) => sum + (b.rating || 0), 0);
    const totalBooks = books.length;
    const C = totalBooks === 0 ? 0 : totalRatings / totalBooks;

    const scored = books.map(book => {
      const views = book.viewStats?.[currentPeriodKey] || 0;
      const reviews = book.reviewStats?.[currentPeriodKey] || 0;
      const R = book.rating || 0;
      const v = reviews;
      const m = 5;
      const bayesian = (v + m === 0) ? 0 : (v / (v + m)) * R + (m / (v + m)) * C;
      const hotScore = views + bayesian * 2;

      return {
        ...book.toObject(),
        hotScore,
        viewCount: views,
        reviewCount: reviews,
        bayesianRating: bayesian
      };
    });

    const topBooks = scored.sort((a, b) => b.hotScore - a.hotScore).slice(0, 10);
    res.json(topBooks);
  } catch (err) {
    console.error('Top books error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
//List sách theo tác giả
exports.getBooksByAuthor = async (req, res) => {
  const { authorId } = req.params; // Lấy authorId từ URL

  try {
    // Tìm các sách của tác giả theo authorId
    const books = await Book.find({ author: authorId });

    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu sách', error: err.message });
  }
};
