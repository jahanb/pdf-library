import jwt from 'jsonwebtoken';
import connectDB from './mongodb';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export function generateToken(userId) {
  return jwt.sign({ userId: userId.toString() }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return null;
  }
}

export async function getUserFromToken(token) {
  if (!token) {
    console.log('No token provided');
    return null;
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    console.log('Token verification failed');
    return null;
  }
  
  try {
    await connectDB();
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      console.log('User not found for token');
      return null;
    }
    return user;
  } catch (error) {
    console.error('Database error in getUserFromToken:', error);
    return null;
  }
}

export function getTokenFromHeaders(headers) {
  // Handle different header formats
  const authHeader = headers.get?.('authorization') || 
                    headers.get?.('Authorization') || 
                    headers.authorization || 
                    headers.Authorization;
  
  if (!authHeader) {
    console.log('No authorization header found');
    return null;
  }
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return authHeader;
}
