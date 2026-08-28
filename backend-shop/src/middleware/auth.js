const jwt = require('jsonwebtoken');

// JWT 驗證中間件
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // 取得 "Bearer <token>" 中的 token

  if (!token) {
    return res.status(401).json({
      status: 401,
      message: '缺少認證 token'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        status: 403,
        message: 'Token 無效或已過期'
      });
    }

    // 把解碼後的用戶信息存到 req.user
    req.user = decoded;
    next();
  });
}

// 驗證是否為管理員
function verifyAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        status: 403,
        message: '需要管理員權限'
      });
    }
    next();
  });
}

module.exports = { verifyToken, verifyAdmin };
