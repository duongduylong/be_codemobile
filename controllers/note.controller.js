// controllers/noteController.js
const Note = require('../models/note.model');

// Lấy tất cả ghi chú của người dùng
exports.getUserNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const notes = await Note.find({ userId }).sort({ createdAt: -1 });

    if (!notes) {
      return res.status(404).json({ message: 'No notes found for this user' });
    }

    res.json({ notes });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Thêm ghi chú cho người dùng
exports.addNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { text } = req.body; // Lấy nội dung ghi chú từ body

    if (!text) {
      return res.status(400).json({ message: 'Note text is required' });
    }

    // Tạo mới ghi chú
    const newNote = new Note({
      text,
      userId
    });

    await newNote.save();

    res.status(201).json({ message: 'Note added successfully', note: newNote });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateNote = async (req, res) => {
    try {
      const { text, isStarred, isChecked } = req.body;
      const note = await Note.findOneAndUpdate(
        { _id: req.params.id },
        { text, isStarred, isChecked },
        { new: true }
      );
      if (!note) return res.status(404).json({ message: 'Note not found' });
      res.json(note);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
};
  
exports.deleteNote = async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({ _id: req.params.id });
        if (!note) return res.status(404).json({ message: 'Note not found' });
        res.json({ message: 'Note deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};