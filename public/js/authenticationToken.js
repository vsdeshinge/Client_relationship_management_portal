const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function authenticateToken(req, res, next) {
  const tokenHeader = req.headers['authorization']; // Get the Authorization header

  // Check if the Authorization header exists
  if (!tokenHeader) {
    console.error('No token provided');
    return res.sendStatus(401); // Unauthorized
  }

  // Split the Bearer token and get the actual token
  const token = tokenHeader.split(' ')[1];

  // Ensure the token exists after splitting
  if (!token) {
    console.error('Token missing after "Bearer"');
    return res.sendStatus(401); // Unauthorized
  }

  console.log('Extracted token:', token);
  console.log('JWT_SECRET being used:', JWT_SECRET);

  // Now verify the token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Failed to verify token:', err.message);
      return res.sendStatus(403); // Forbidden
    }

    // Assign the user from the token to req.user
    req.user = user;

    // Check if the role is present in the token payload
    if (!req.user.role) {
      console.error('No role found in token');
      return res.sendStatus(403); // Forbidden
    }

    // Check if the role is either 'admin' or 'syndicate'
    if (req.user.role !== 'admin' && req.user.role !== 'syndicate') {
      console.error('Unauthorized role:', req.user.role);
      return res.sendStatus(403); // Forbidden for roles other than admin or syndicate
    }

    console.log('Token verified, user:', user);
    next(); // Proceed to the next middleware or route handler
  });
};