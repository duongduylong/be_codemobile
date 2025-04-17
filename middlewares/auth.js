const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Expect: "Bearer <token>"

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, 'secretKey'); // Phải khớp với key lúc sign
    req.user = decoded; // decoded = { id: ..., iat: ..., exp: ... }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = auth;
