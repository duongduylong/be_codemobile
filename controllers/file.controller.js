const fs = require('fs');
const { PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const s3Client = require('../config/s3Client');
const path = require('path');

const bucketName = 'book-files';

exports.uploadFiles = async (req, res) => {
  const files = req.files;
  const bookId = req.body.bookId;
  if (!files || files.length === 0 || !bookId) {
    return res.status(400).json({ error: 'No files uploaded or missing bookId' });
  }

  const uploadedFiles = [];

  try {
    for (const file of files) {
      const fileStream = fs.createReadStream(file.path);
      const relativePath = file.originalname.replace(/\\/g, '/'); 
      const fileKey = `${bookId}/${relativePath}`;

      const contentType = path.extname(relativePath).toLowerCase() === '.txt'
        ? 'text/plain; charset=utf-8'
        : file.mimetype;

      const uploadParams = {
        Bucket: bucketName,
        Key: fileKey, 
        Body: fileStream,
        ContentType: contentType,
      };

      await s3Client.send(new PutObjectCommand(uploadParams));
      fs.unlinkSync(file.path);

      const fileUrl = `http://localhost:9000/${bucketName}/${fileKey}`;
      uploadedFiles.push({ name: relativePath, url: fileUrl });
    }

    res.json({ message: 'Files uploaded successfully', files: uploadedFiles });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
};

exports.listFiles = async (req, res) => {
  try {
    const data = await s3Client.send(new ListObjectsV2Command({ Bucket: bucketName }));
    const files = data.Contents?.map((file) => ({
      key: file.Key,
      size: file.Size,
      lastModified: file.LastModified,
      url: `http://localhost:9000/${bucketName}/${file.Key}`,
    }));
    res.json({ files });
  } catch (err) {
    console.error('List error:', err);
    res.status(500).json({ error: 'Failed to list files' });
  }
};
