const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET; // Ensure this is set in your .env file

function verifyAdminToken(req, res, next) {
    const tokenHeader = req.headers['authorization'];

    if (!tokenHeader) {
        console.error('No token provided');
        return res.sendStatus(401); // Unauthorized
    }

    const token = tokenHeader.split(' ')[1];

    if (!token) {
        console.error('Token missing after "Bearer"');
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Failed to verify token:', err.message);
            return res.sendStatus(403); // Forbidden
        }

        // Check if the user role is 'admin'
        if (user.role !== 'admin') {
            console.error('Unauthorized role:', user.role);
            return res.sendStatus(403); // Forbidden
        }

        req.user = user; // Add the user to the request object
        next();
    });
}

module.exports = verifyAdminToken;
