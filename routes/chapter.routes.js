// const express = require('express');
// const router = express.Router();
// const Chapter = require('../models/chapter.model');
// const User = require('../models/user.model');
// const auth = require('../middlewares/auth');
// const Book = require('../models/book.model');

// // Get chapters of a book
// router.get('/:bookId', async (req, res) => {
//   const chapters = await Chapter.find({ bookId: req.params.bookId }).sort({ chapterNumber: 1 });
//   res.json(chapters);
// });

// // Get single chapter
// router.get('/book/:id', auth, async (req, res) => {
//   const chapterId = req.params.id;
//   const userId = req.user.id; // Được gán từ JWT middleware
  
//   try {
//     // Tìm chương theo ID
//     const chapter = await Chapter.findById(chapterId);
//     // console.log(chapter);
//     if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

//     // Tìm sách chứa chương này
//     const bookId = chapter.bookId;
//     const book = await Book.findById(bookId);
//     if (!book) return res.status(404).json({ message: 'Book not found' });
//     // const now = new Date();
//     const now = new Date();

//     // Reset viewStats nếu qua ngày/tuần/tháng
//     const updateStatIfNeeded = (key, getPeriodStart) => {
//       const lastUpdate = book.lastStatsUpdate?.[key];
//       const startOfPeriod = getPeriodStart(now);
//       if (!lastUpdate || new Date(lastUpdate) < startOfPeriod) {
//         book.viewStats[key] = 0;
//         book.lastStatsUpdate[key] = now;
//       }
//       book.viewStats[key] += 1;
//     };

//     updateStatIfNeeded('day', date => new Date(date.setHours(0, 0, 0, 0)));
//     updateStatIfNeeded('week', date => {
//       const d = new Date(date);
//       const diff = d.getDate() - d.getDay();
//       return new Date(d.setDate(diff)).setHours(0, 0, 0, 0);
//     });
//     updateStatIfNeeded('month', date => new Date(date.getFullYear(), date.getMonth(), 1));
//     book.views+=1;
//     await book.save();
//     const user = await User.findById(userId);
//     // console.log(bookId);
//     // console.log(user);

//     // Kiểm tra xem người dùng có tồn tại không
//     if (!user) return res.status(404).json({ message: 'User not found' });

    
//     // Cập nhật readHistory
//     const readHistory = user.readHistory.find(history => history.bookId.toString() === bookId.toString());
//     const totalChapters = await Chapter.countDocuments({ bookId: bookId });
//     if (readHistory) {
//       const prevChapterNumber = await Chapter.findById(readHistory.chapterId);
//       // Nếu đã có trong lịch sử đọc
//       if (readHistory.status === 'reading' && chapter.chapterNumber > prevChapterNumber.chapterNumber) {
//         // Cập nhật chapter đang đọc và trạng thái
//         readHistory.chapterId = chapter;
//         readHistory.status = 'reading';
//       }

//       if (readHistory.status === 'reading' && chapter.chapterNumber === totalChapters) {
//         // Nếu là chương cuối, đánh dấu là đã đọc
//         readHistory.status = 'finished';
//         readHistory.chapterId = null; // Đặt lại chapterId nếu không cần
//       }
//     } else {
//       // Nếu chưa có lịch sử đọc sách này
//       user.readHistory.push({
//         bookId: bookId,
//         chapterId: chapter,
//         status: chapter.chapterNumber === totalChapters ? 'finished' : 'reading',
//         readAt: new Date(),
//       });
//     }
//     // console.log(readHistory);

//     // Lưu lại thay đổi vào user
//     await user.save();

//     // Trả về chapter
//     res.json(chapter);

//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// // Thêm một chapter mới
// router.post('/', async (req, res) => {
//   try {
//     const { bookId, chapterNumber, title, content } = req.body;
//     const chapter = new Chapter({ bookId, chapterNumber, title, content });
//     await chapter.save();
//     const book = await Book.findById(bookId);
//     book.totalChapters+=1;
//     await book.save();
//     res.status(201).json({ message: 'Chapter added successfully', chapter });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to add chapter', error: err.message });
//   }
// });

// // Cập nhật một chapter
// router.put('/:id', async (req, res) => {
//   try {
//     const { title, content, chapterNumber } = req.body;
//     const chapter = await Chapter.findByIdAndUpdate(
//       req.params.id,
//       { title, content, chapterNumber },
//       { new: true }
//     );
//     if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
//     res.json({ message: 'Chapter updated', chapter });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to update chapter', error: err.message });
//   }
// });

// // Xóa một chapter
// router.delete('/:id', async (req, res) => {
//   try {
//     const chapter = await Chapter.findByIdAndDelete(req.params.id);
//     const book = await Book.findById(chapter.bookId);
//     book.totalChapters-=1;
//     await book.save();
//     if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
//     res.json({ message: 'Chapter deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to delete chapter', error: err.message });
//   }
// });

// module.exports = router;
// routes/chapter.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const chapterController = require('../controllers/chapter.controller');

// Public
router.get('/:bookId', chapterController.getChaptersByBook);

// Protected
router.get('/book/:id', auth, chapterController.getSingleChapter);

// Admin / Author - No auth middleware added yet (add if needed)
router.post('/', chapterController.addChapter);
router.put('/:id', chapterController.updateChapter);
router.delete('/:id', chapterController.deleteChapter);

module.exports = router;