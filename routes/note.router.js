// routes/noteRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const noteController = require('../controllers/note.controller');

router.get('/',auth, noteController.getUserNotes);
router.post('/add',auth, noteController.addNote);
router.put('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

module.exports = router;
