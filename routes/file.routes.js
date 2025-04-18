const express = require('express');
const multer = require('multer');
const fs = require('fs');
const fileController = require('../controllers/file.controller');

const router = express.Router();
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const upload = multer({ dest: uploadDir });

router.post('/upload', upload.array('file', 10), fileController.uploadFiles);
router.get('/files', fileController.listFiles);

module.exports = router;
