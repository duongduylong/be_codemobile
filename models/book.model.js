const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
  genres: [String],
  description: String,
  coverImage: String,
  totalChapters: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  viewStats: {
    day: { type: Number, default: 0 },
    week: { type: Number, default: 0 },
    month: { type: Number, default: 0 }
  },
  reviewStats: {
    day: { type: Number, default: 0 },
    week: { type: Number, default: 0 },
    month: { type: Number, default: 0 }
  },
  lastStatsUpdate: {
    day: { type: Date },
    week: { type: Date },
    month: { type: Date }
  },
  // reviews: [
  //   {
  //     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  //     comment: String,
  //     rating: Number,
  //   },
  // ],
});

module.exports = mongoose.model('Book', BookSchema);
