
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
