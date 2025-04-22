// controllers/chapter.controller.js
const Chapter = require('../models/chapter.model');
const User = require('../models/user.model');
const Book = require('../models/book.model');
const Author = require('../models/author.model');

// Get all chapters of a book
exports.getChaptersByBook = async (req, res) => {
  try {
    const chapters = await Chapter.find({ bookId: req.params.bookId }).sort({ chapterNumber: 1 });
    res.json(chapters);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chapters', error: err.message });
  }
};

// Get single chapter with read history + stats update
exports.getSingleChapter = async (req, res) => {
  const chapterId = req.params.id;
  const userId = req.user.id;

  try {
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    const book = await Book.findById(chapter.bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const now = new Date();
    const updateStatIfNeeded = (key, getPeriodStart) => {
      const lastUpdate = book.lastStatsUpdate?.[key];
      const startOfPeriod = getPeriodStart(new Date(now));
      if (!lastUpdate || new Date(lastUpdate) < startOfPeriod) {
        book.viewStats[key] = 0;
        book.lastStatsUpdate[key] = now;
      }
      book.viewStats[key] += 1;
    };

    updateStatIfNeeded('day', date => new Date(date.setHours(0, 0, 0, 0)));
    updateStatIfNeeded('week', date => {
      const d = new Date(date);
      const diff = d.getDate() - d.getDay();
      return new Date(d.setDate(diff)).setHours(0, 0, 0, 0);
    });
    updateStatIfNeeded('month', date => new Date(date.getFullYear(), date.getMonth(), 1));

    book.views += 1;
    const author = await Author.findById(book.author);
    author.totalViews+=1;
    await author.save();
    await book.save();

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const readHistory = user.readHistory.find(h => h.bookId.toString() === book._id.toString());
    const totalChapters = await Chapter.countDocuments({ bookId: book._id });

    if (readHistory) {
      const prevChapter = await Chapter.findById(readHistory.chapterId);
      if (readHistory.status === 'reading' && chapter.chapterNumber > prevChapter?.chapterNumber) {
        readHistory.chapterId = chapter;
        readHistory.status = 'reading';
      }
      if (readHistory.status === 'reading' && chapter.chapterNumber === totalChapters) {
        readHistory.status = 'finished';
        readHistory.chapterId = null;
      }
    } else {
      user.readHistory.push({
        bookId: book._id,
        chapterId: chapter,
        status: chapter.chapterNumber === totalChapters ? 'finished' : 'reading',
        readAt: now,
      });
    }

    await user.save();
    res.json(chapter);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Add new chapter
exports.addChapter = async (req, res) => {
  try {
    const { bookId, chapterNumber, title, content } = req.body;
    const chapter = new Chapter({ bookId, chapterNumber, title, content });
    await chapter.save();

    const book = await Book.findById(bookId);
    book.totalChapters += 1;
    await book.save();

    res.status(201).json({ message: 'Chapter added successfully', chapter });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add chapter', error: err.message });
  }
};

// Update chapter
exports.updateChapter = async (req, res) => {
  try {
    const { title, content, chapterNumber } = req.body;
    const chapter = await Chapter.findByIdAndUpdate(
      req.params.id,
      { title, content, chapterNumber },
      { new: true }
    );
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    res.json({ message: 'Chapter updated', chapter });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update chapter', error: err.message });
  }
};

// Delete chapter
exports.deleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndDelete(req.params.id);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    const book = await Book.findById(chapter.bookId);
    book.totalChapters -= 1;
    await book.save();

    res.json({ message: 'Chapter deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete chapter', error: err.message });
  }
};
