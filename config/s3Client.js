// s3Client.js
const { S3Client } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: 'us-east-1',
  endpoint: 'http://localhost:9000',
  credentials: {
    accessKeyId: 'ROOTUSER',
    secretAccessKey: 'CHANGEME123',
  },
  forcePathStyle: true, // quan trọng với MinIO
});

module.exports = s3Client;
