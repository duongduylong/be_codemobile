// const express = require('express');
// const router = express.Router();
// const Review = require('../models/review.model');
// const Book = require('../models/book.model');
// const auth = require('../middlewares/auth');

// // Add review
// router.post('/', auth, async (req, res) => {
//     const { bookId, rating, comment } = req.body;
//     const userId = req.user.id;
  
//     try {
//       // 1. Tìm review cũ nếu có
//       let review = await Review.findOne({ bookId, userId });
  
//       if (review) {
//         review.rating = rating;
//         review.comment = comment;
//         await review.save();
//       } else {
//         review = await Review.create({ bookId, userId, rating, comment });
//       }
  
//       // 2. Cập nhật điểm trung bình đánh giá (rating)
//       const reviews = await Review.find({ bookId });
//       const totalRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
//       const averageRating = reviews.length > 0 ? (totalRatings / reviews.length).toFixed(2) : 0;
  
//       const book = await Book.findById(bookId);
//       if (!book) return res.status(404).json({ message: 'Book not found' });
  
//       book.rating = parseFloat(averageRating); // cập nhật điểm trung bình
  
//       // 3. Cập nhật reviewStats
//       const now = new Date();
  
//       const updateStats = (key, getStart) => {
//         const lastUpdate = book.lastStatsUpdate?.[key];
//         const startOfPeriod = getStart(new Date(now));
//         if (!lastUpdate || new Date(lastUpdate) < startOfPeriod) {
//           book.reviewStats[key] = 0;
//           book.lastStatsUpdate[key] = now;
//         }
//         book.reviewStats[key] += 1;
//       };
  
//       updateStats('day', date => new Date(date.setHours(0, 0, 0, 0)));
//       updateStats('week', date => {
//         const d = new Date(date);
//         const diff = d.getDate() - d.getDay(); // Chủ nhật
//         return new Date(d.setDate(diff)).setHours(0, 0, 0, 0);
//       });
//       updateStats('month', date => new Date(date.getFullYear(), date.getMonth(), 1));
  
//       await book.save();
  
//       res.status(200).json({ message: 'Review added successfully', review });
//     } catch (err) {
//       console.error('Add review error:', err);
//       res.status(500).json({ message: 'Server error', error: err.message });
//     }
// });
  
// module.exports = router;
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const  reviewController = require('../controllers/review.controller');

router.post('/', auth, reviewController.addReview);
router.get('/:bookId', reviewController.getReviewsByBook);
router.get('/',reviewController.getReviews);
module.exports = router;
