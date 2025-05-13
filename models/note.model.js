const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  text: { type: String, required: true }, 
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isStarred: { type: Boolean, default: false },
  isChecked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now } 
});

module.exports = mongoose.model('Note', NoteSchema);
