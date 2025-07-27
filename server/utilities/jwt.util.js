import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Sign a JWT with a payload
export const generateToken = (payload, expiresIn) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

// Verify a JWT and return decoded payload
export const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

