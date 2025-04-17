const mongoose = require('mongoose');

const ReadHistorySchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', default: null },
  status: { type: String, enum: ['reading', 'finished'], default: 'reading' },
  readAt: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  favoriteGenres: [String],
  readHistory: [ReadHistorySchema],
});

module.exports = mongoose.model('User', UserSchema);
