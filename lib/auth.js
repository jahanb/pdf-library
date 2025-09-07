/*
import jwt from 'jsonwebtoken';
import connectDB from './mongodb';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || '6de2575fee29cb68d4c136b683273a8a2796eb49c1ac5b2a4ee442261f1f3a8c';

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
    console.log('❌ No token provided');
    return null;
  }

  // Verify token
  const decoded = verifyToken(token);
  console.log("🔑 Decoded token:", decoded);

  if (!decoded) {
    console.log('❌ Token verification failed');
    return null;
  }

  try {
    // Connect to DB
    await connectDB();
    console.log("📡 Connected to DB, looking for user with ID:", decoded.userId);

    // Try fetching by ObjectId
    let user = await User.findById(decoded.userId).select('-password');

    // If not found, fallback to string-based query
    if (!user) {
      console.log("⚠️ User not found with findById, trying string match...");
      user = await User.findOne({ _id: decoded.userId }).select('-password');
    }

    if (!user) {
      console.log('❌ User not found for token:', decoded.userId);
      return null;
    }

    console.log("✅ User found:", user.email || user._id.toString());
    return user;
  } catch (error) {
    console.error('💥 Database error in getUserFromToken:', error);
    return null;
  }
}

export function getTokenFromHeaders(headers) {
  console.log("🔍 Incoming headers type:", typeof headers);

  // If it's a Map-like (Next.js, fetch)
  if (typeof headers.get === 'function') {
    console.log("Headers (Map-like):", Array.from(headers.entries()));
    const authHeader = headers.get('authorization') || headers.get('Authorization');

    if (!authHeader) {
      console.log('⚠️ No authorization header found (Map-like)');
      return null;
    }

    console.log("✅ Found authorization header:", authHeader);
    return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  }

  // If it's a plain object (Express, Node)
  console.log("Headers (Object):", headers);
  const authHeader = headers['authorization'] || headers['Authorization'];

  if (!authHeader) {
    console.log('⚠️ No authorization header found (Object)');
    return null;
  }
    if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return authHeader;
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
  */


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
