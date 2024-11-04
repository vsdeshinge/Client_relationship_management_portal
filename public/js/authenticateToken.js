const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function authenticateToken(req, res, next) {
  const tokenHeader = req.headers['authorization'];

  if (!tokenHeader) {
    return res.status(401).json({ error: 'Authorization header is required.' }); // Unauthorized
  }

  const token = tokenHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token is required.' }); // Unauthorized
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token.' }); // Forbidden
    }

    req.user = user;

    // Ensure role is either 'admin' or 'syndicate'
    if (!req.user.role || (req.user.role !== 'admin' && req.user.role !== 'syndicate')) {
      return res.status(403).json({ error: 'Invalid role.' }); // Forbidden
    }

    // Ensure `syndicate_name` is available if the role is `syndicate`
    if (req.user.role === 'syndicate' && !req.user.syndicate_name) {
      return res.status(400).json({ error: 'Invalid syndicate token. Could not determine syndicate name.' });
    }

    next();
  });
};
