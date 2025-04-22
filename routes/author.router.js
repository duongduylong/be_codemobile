const express = require('express');
const router = express.Router();
const authorController = require('../controllers/author.controller');

// API đề xuất tác giả theo tổng view
router.get('/recommended', authorController.getRecommendedAuthors);
// API sửa thông tin tác giả
router.put('/:id', authorController.updateAuthor);

// API xóa tác giả
router.delete('/:id', authorController.deleteAuthor);

// API thêm tác giả mới
router.post('/', authorController.createAuthor);

module.exports = router;
