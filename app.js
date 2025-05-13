const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const auth = require('./middlewares/auth');
const Book = require('./models/book.model');
require('dotenv').config();

const userRoutes = require('./routes/user.routes');
const bookRoutes = require('./routes/book.routes');
const chapterRoutes = require('./routes/chapter.routes');
const reviewRoutes = require('./routes/review.routes');
const fileRoutes = require('./routes/file.routes');
const authorRoutes = require('./routes/author.router');
const noteRoutes = require('./routes/note.router');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/notes', noteRoutes);

// app.get('/recommend',auth , (req, res) => {
//   const userId = req.user.id;

//   // Chạy script Python với userId làm tham số đầu vào
//   const python = spawn('python', ['./AI_model/recommend.py', userId]);

//   let dataToSend = '';

//   python.stdout.on('data', (data) => {
//     dataToSend += data.toString();  // Ghi dữ liệu từ Python vào biến dataToSend
//     console.log('Data from Python: ', dataToSend);  // Log để kiểm tra dữ liệu nhận được
//   });

//   python.stderr.on('data', (data) => {
//     console.error(`stderr: ${data}`);  // Xử lý lỗi nếu có từ Python
//   });

//   python.on('close', (code) => {
//     console.log(`Python process closed with code: ${code}`);

//     try {
//       // Kiểm tra dữ liệu trả về
//       const cleanedData = dataToSend.trim();  // Loại bỏ bất kỳ ký tự thừa nào
//       console.log('Cleaned Data:', cleanedData);  // Log dữ liệu đã được làm sạch

//       // Parse dữ liệu JSON trả về từ Python
//       const jsonData = JSON.parse(cleanedData);  
//       res.json(jsonData);  // Trả kết quả về cho client
//     } catch (error) {
//       console.error("Error parsing JSON: ", error);
//       res.status(500).json({ error: 'Failed to parse prediction result' });
//     }
//   });
// });

app.get('/recommend', auth, async (req, res) => {
  const userId = req.user.id;

  const python = spawn('python', ['./AI_model/recommend.py', userId]);

  let dataToSend = '';

  python.stdout.on('data', (data) => {
    dataToSend += data.toString();
    console.log('Data from Python:', dataToSend);
  });

  python.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  python.on('close', async (code) => {
    console.log(`Python process closed with code: ${code}`);

    try {
      const cleanedData = dataToSend.trim();
      const jsonData = JSON.parse(cleanedData);

      // Nếu mô hình trả về lỗi "User not found", fallback về top sách
      if (jsonData.error === "User not found") {
        const books = await Book.find().sort({ rating: -1, views: -1 }).limit(10);
        return res.json(books);
      }

      // Trả về dữ liệu gợi ý từ mô hình AI
      res.json(jsonData);

    } catch (error) {
      console.error("Error parsing JSON:", error);
      res.status(500).json({ error: 'Failed to parse prediction result' });
    }
  });
});

mongoose.connect('mongodb://localhost:27017/appbook')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
