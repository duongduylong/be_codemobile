const mongoose = require('mongoose');

const AuthorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: String,
  image: String,
  totalViews: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Author', AuthorSchema);