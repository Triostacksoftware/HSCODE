import { verifyToken } from "../utilities/jwt.util.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({ message: 'No token provided. Please log in.' });
    }

    // Verify token and extract id & role
    const decoded = verifyToken(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ message: 'Unauthorized or token expired' });
  }
};
