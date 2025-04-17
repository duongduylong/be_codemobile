const mongoose = require('mongoose');

const ChapterSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  chapterNumber: Number,
  title: String,
  content: String,
});

module.exports = mongoose.model('Chapter', ChapterSchema);
