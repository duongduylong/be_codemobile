// const express = require('express');
// const router = express.Router();
// const Book = require('../models/book.model');
// const User = require('../models/user.model');

// // Get all books
// router.get('/', async (req, res) => {
//   const books = await Book.find();
//   res.json(books);
// });

// // Add new book
// router.post('/', async (req, res) => {
//   try {
//     const { title, author, genres, description, coverImage } = req.body;

//     const newBook = new Book({
//       title,
//       author,
//       genres,
//       description,
//       coverImage, // URL hoặc base64
//       rating: 0,
//       views: 0,
//       reviews: []
//     });

//     await newBook.save();
//     res.status(201).json({ message: 'Book added successfully', book: newBook });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error while adding book' });
//   }
// });

// // --- UPDATE book ---
// router.put('/:id', async (req, res) => {
//   try {
//     const { title, author, genres, description, coverImage,views,rating} = req.body;
//     const updatedBook = await Book.findByIdAndUpdate(
//       req.params.id,
//       { title, author, genres, description, coverImage,views,rating },
//       { new: true }
//     );

//     if (!updatedBook) return res.status(404).json({ message: 'Book not found' });
//     res.json({ message: 'Book updated successfully', book: updatedBook });
//   } catch (err) {
//     res.status(500).json({ message: 'Error updating book', error: err.message });
//   }
// });

// // --- DELETE book ---
// router.delete('/:id', async (req, res) => {
//   try {
//     const deletedBook = await Book.findByIdAndDelete(req.params.id);
//     if (!deletedBook) return res.status(404).json({ message: 'Book not found' });
//     res.json({ message: 'Book deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Error deleting book', error: err.message });
//   }
// });

// // Search books
// router.get('/search', async (req, res) => {
//   const { q } = req.query;
//   const books = await Book.find({
//     $or: [
//       { title: new RegExp(q, 'i') },
//       { author: new RegExp(q, 'i') },
//       { genres: new RegExp(q, 'i') },
//     ],
//   });
//   res.json(books);
// });

// // Get book detail
// router.get('/:id', async (req, res) => {
//   const book = await Book.findById(req.params.id);
//   // book.views += 1;
//   await book.save();
//   res.json(book);
// });

// // Add review
// // router.post('/:id/review', async (req, res) => {
// //   const book = await Book.findById(req.params.id);
// //   book.reviews.push(req.body);
// //   const totalRating = book.reviews.reduce((sum, r) => sum + r.rating, 0);
// //   book.rating = totalRating / book.reviews.length;
// //   await book.save();
// //   res.json(book);
// // });

// // Top rated books
// router.get('/top/rated', async (req, res) => {
//   const books = await Book.find().sort({ rating: -1, views: -1 }).limit(10);
//   res.json(books);
// });

// // Top books by period
// router.get('/top/abc', async (req, res) => {
//   const { period = 'day' } = req.query;

//   const now = new Date();
//   let currentPeriodKey = '';
//   let shouldReset = (lastDate) => true;

//   switch (period) {
//     case 'week':
//       currentPeriodKey = 'week';
//       shouldReset = (lastDate) => {
//         // const start = new Date(now);
//         // start.setDate(now.getDate() - now.getDay());
//         // start.setHours(0, 0, 0, 0);
//         // return !lastDate || new Date(lastDate) < start;
//         const start = new Date(now);
//         const day = start.getDay();
//         const diff = (day === 0 ? -6 : 1 - day); // CN thì lùi 6 ngày, còn lại tính bình thường
//         start.setDate(start.getDate() + diff);
//         start.setHours(0, 0, 0, 0);
//         return !lastDate || new Date(lastDate) < start;
//       };
//       break;
//     case 'month':
//       currentPeriodKey = 'month';
//       shouldReset = (lastDate) => {
//         const start = new Date(now.getFullYear(), now.getMonth(), 1);
//         return !lastDate || new Date(lastDate) < start;
//       };
//       break;
//     default:
//       currentPeriodKey = 'day';
//       shouldReset = (lastDate) => {
//         const start = new Date(now.setHours(0, 0, 0, 0));
//         return !lastDate || new Date(lastDate) < start;
//       };
//       break;
//   }

//   try {
//     const books = await Book.find();

//     for (const book of books) {
//       const lastUpdate = book.lastStatsUpdate?.[currentPeriodKey];
//       if (shouldReset(lastUpdate)) {
//         book.viewStats[currentPeriodKey] = 0;
//         book.reviewStats[currentPeriodKey] = 0;
//         book.lastStatsUpdate[currentPeriodKey] = new Date();
//         await book.save();
//       }
//     }

//     const totalRatings = books.reduce((sum, b) => sum + (b.rating || 0), 0);
//     const totalBooks = books.length;
//     const C = totalBooks === 0 ? 0 : totalRatings / totalBooks;
    
//     const scored = books.map(book => {
//       const views = book.viewStats?.[currentPeriodKey] || 0;
//       const reviews = book.reviewStats?.[currentPeriodKey] || 0;
//       const R = book.rating || 0;
//       const v = reviews;
//       const m = 5;
//       const bayesian = (v + m === 0) ? 0 : (v / (v + m)) * R + (m / (v + m)) * C;
//       const hotScore = views + bayesian * 2;

//       return {
//         ...book.toObject(),
//         hotScore,
//         viewCount: views,
//         reviewCount: reviews,
//         bayesianRating: bayesian
//       };
//     });

//     const topBooks = scored.sort((a, b) => b.hotScore - a.hotScore).slice(0, 10);
//     res.json(topBooks);

//   } catch (err) {
//     console.error('Top books error:', err);
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book.controller');

router.get('/', bookController.getAllBooks);
router.post('/', bookController.addBook);
router.put('/:id', bookController.updateBook);
router.delete('/:id', bookController.deleteBook);
router.get('/search', bookController.searchBooks);
router.get('/top/rated', bookController.getTopRatedBooks);
router.get('/top/abc', bookController.getTopBooksByPeriod);
router.get('/:id', bookController.getBookDetail);
router.get('/:authorId/listbook', bookController.getBooksByAuthor);

module.exports = router;
