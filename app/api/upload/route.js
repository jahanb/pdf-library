
import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Book from '../../../models/Books';
import { getUserFromToken, getTokenFromHeaders } from '../../../lib/auth';

export async function POST(request) {
  console.log('\n--- UPLOAD REQUEST START ---');
  
  try {
    // Log request headers
    console.log('Request headers:');
    for (const [key, value] of request.headers.entries()) {
      if (key === 'authorization') {
        console.log(`${key}: ${value ? 'Bearer [token present]' : 'Missing'}`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    // Get authenticated user
    const token = getTokenFromHeaders(request.headers);
    console.log('Extracted token:', token ? 'Present' : 'Missing');

    const user = await getUserFromToken(token);
    console.log('User from token:', user ? user.username : 'Not found');

    if (!user) {
      console.log('Authentication failed - no user found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('Authentication successful for user:', user.username);

    await connectDB();
    console.log('Database connected successfully');

    // Parse form data
    let data;
    try {
      data = await request.formData();
      console.log('FormData parsed successfully');
    } catch (formError) {
      console.error('FormData parsing error:', formError);
      return NextResponse.json(
        { error: 'Failed to parse form data' },
        { status: 400 }
      );
    }
    
    const title = data.get('title');
    const author = data.get('author');
    const description = data.get('description');
    const pdfFile = data.get('pdf');

    console.log('Form data received:');
    console.log('Title:', title);
    console.log('Author:', author);
    console.log('Description:', description);
    console.log('PDF file:', pdfFile ? {
      name: pdfFile.name,
      size: pdfFile.size,
      type: pdfFile.type
    } : 'Not received');

    // Validation
    if (!title || !author || !pdfFile) {
      console.log('Validation failed - missing required fields');
      return NextResponse.json(
        { error: 'Title, author, and PDF file are required' },
        { status: 400 }
      );
    }

    if (pdfFile.type !== 'application/pdf') {
      console.log('Validation failed - invalid file type:', pdfFile.type);
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    if (pdfFile.size > 50 * 1024 * 1024) {
      console.log('Validation failed - file too large:', pdfFile.size);
      return NextResponse.json(
        { error: 'File size must be less than 50MB' },
        { status: 400 }
      );
    }

    console.log('Validation passed, processing file...');

    try {
      // Convert file to buffer
      const bytes = await pdfFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      console.log('File converted to buffer, size:', buffer.length);
      
      // Create new book with user association
      const bookData = {
        title: title,
        author: author,
        description: description || '',
        pdfData: buffer,
        pdfContentType: pdfFile.type,
        fileName: pdfFile.name,
        fileSize: pdfFile.size,
        userId: user._id
      };

      console.log('Creating book document with data:', {
        title,
        author,
        description: description || '',
        fileName: pdfFile.name,
        fileSize: pdfFile.size,
        userId: user._id.toString(),
        pdfDataSize: buffer.length
      });

      const book = new Book(bookData);
      await book.save();

      console.log('Book saved successfully with ID:', book._id);

      const responseData = {
        success: true,
        book: {
          id: book._id.toString(),
          title: book.title,
          author: book.author,
          description: book.description,
          fileName: book.fileName,
          fileSize: book.fileSize,
          uploadDate: book.uploadDate,
        },
      };

      console.log('Returning success response:', responseData);
      console.log('--- UPLOAD REQUEST SUCCESS ---\n');

      return NextResponse.json(responseData, { status: 201 });

    } catch (dbError) {
      console.error('Database save error:', dbError);
      console.error('Error details:', dbError.message);
      console.error('Error stack:', dbError.stack);
      console.log('--- UPLOAD REQUEST DB ERROR ---\n');
      
      return NextResponse.json(
        { error: 'Error saving to database: ' + dbError.message },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('General upload error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    console.log('--- UPLOAD REQUEST GENERAL ERROR ---\n');
    
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
