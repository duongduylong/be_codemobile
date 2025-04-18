// controllers/review.controller.js
const Review = require('../models/review.model');
const Book = require('../models/book.model');

exports.addReview = async (req, res) => {
  const { bookId, rating, comment } = req.body;
  const userId = req.user.id;

  try {
    // Tìm review cũ nếu có
    let review = await Review.findOne({ bookId, userId });

    if (review) {
      review.rating = rating;
      review.comment = comment;
      await review.save();
    } else {
      review = await Review.create({ bookId, userId, rating, comment });
    }

    // Tính điểm trung bình
    const reviews = await Review.find({ bookId });
    const totalRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRatings / reviews.length).toFixed(2) : 0;

    // Cập nhật sách
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    book.rating = parseFloat(averageRating);

    // Cập nhật reviewStats
    const now = new Date();

    const updateStats = (key, getStart) => {
      const lastUpdate = book.lastStatsUpdate?.[key];
      const startOfPeriod = getStart(new Date(now));
      if (!lastUpdate || new Date(lastUpdate) < startOfPeriod) {
        book.reviewStats[key] = 0;
        book.lastStatsUpdate[key] = now;
      }
      book.reviewStats[key] += 1;
    };

    updateStats('day', date => new Date(date.setHours(0, 0, 0, 0)));
    updateStats('week', date => {
      const d = new Date(date);
      const diff = d.getDate() - d.getDay();
      return new Date(d.setDate(diff)).setHours(0, 0, 0, 0);
    });
    updateStats('month', date => new Date(date.getFullYear(), date.getMonth(), 1));

    await book.save();

    res.status(200).json({ message: 'Review added successfully', review });
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
