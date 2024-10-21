const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function authenticateToken(req, res, next) {
  const tokenHeader = req.headers['authorization'];

  if (!tokenHeader) {
    return res.sendStatus(401); // Unauthorized
  }

  const token = tokenHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }

    req.user = user;

    if (!req.user.role || (req.user.role !== 'admin' && req.user.role !== 'syndicate')) {
      return res.sendStatus(403); // Forbidden
    }

    next();
  });
};

