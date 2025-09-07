
import connectDB from '../../../../lib/mongodb';
import Book from '../../../../models/Books';
import { NextResponse } from 'next/server';
import { getUserFromToken, getTokenFromHeaders } from '../../../../lib/auth';

export async function GET(request, { params }) {
  const { id } = params;

  console.log('\n--- PDF REQUEST START ---');
  console.log('Book ID requested:', id);

  try {
    // Try to get token from Authorization header first
    let token = getTokenFromHeaders(request.headers);
    
    // If no token in headers, try query parameter (for iframe)
    if (!token) {
      const url = new URL(request.url);
      token = url.searchParams.get('token');
      console.log('Token from query parameter:', token ? 'Present' : 'Missing');
    } else {
      console.log('Token from Authorization header:', token ? 'Present' : 'Missing');
    }

    // Get authenticated user
    const user = await getUserFromToken(token);
    console.log('User from token:', user ? user.username : 'Not found');

    if (!user) {
      console.log('Authentication failed - returning 401');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('Authentication successful for user:', user.username);

    await connectDB();
    console.log('Database connected');
    
    // Only allow access to user's own books
    const book = await Book.findOne({ 
      _id: id, 
      userId: user._id 
    });
    
    console.log('Book found:', book ? 'Yes' : 'No');
    
    if (!book) {
      console.log('Book not found or access denied');
      return NextResponse.json(
        { error: 'Book not found or access denied' },
        { status: 404 }
      );
    }

    console.log('Book access granted:', {
      title: book.title,
      fileName: book.fileName,
      size: book.pdfData.length
    });

    // Create response with PDF data
    const response = new NextResponse(book.pdfData);
    
    // Set appropriate headers for PDF
    response.headers.set('Content-Type', book.pdfContentType);
    response.headers.set('Content-Length', book.pdfData.length.toString());
    response.headers.set('Content-Disposition', `inline; filename="${book.fileName}"`);
    response.headers.set('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Headers', 'Authorization');

    console.log('PDF response sent successfully');
    console.log('--- PDF REQUEST SUCCESS ---\n');

    return response;

  } catch (error) {
    console.error('PDF retrieval error:', error);
    console.log('--- PDF REQUEST ERROR ---\n');
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS (if needed)
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization',
    },
  });
}