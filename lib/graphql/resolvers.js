
import connectDB from '../mongodb';
import Book from '../../models/Books';
import { getUserFromToken, getTokenFromHeaders } from '../auth';

// Helper function to get user from context with better error handling
async function getAuthenticatedUser(headers) {
  try {
    const token = getTokenFromHeaders(headers);
    if (!token) {
      throw new Error('No authentication token provided');
    }
    
    const user = await getUserFromToken(token);
    if (!user) {
      throw new Error('Invalid or expired token');
    }
    
    return user;
  } catch (error) {
    console.error('Authentication error:', error.message);
    throw new Error('Authentication failed');
  }
}

export const resolvers = {
  Query: {
    books: async (_, __, context) => {
      try {
        const user = await getAuthenticatedUser(context.req.headers);
        await connectDB();
        
        const books = await Book.find({ userId: user._id })
          .select('-pdfData')
          .sort({ createdAt: -1 });
          
        return books.map(book => ({
          ...book.toObject(),
          id: book._id.toString(),
        }));
      } catch (error) {
        console.error('Books query error:', error);
        throw error;
      }
    },

    book: async (_, { id }, context) => {
      try {
        const user = await getAuthenticatedUser(context.req.headers);
        await connectDB();
        
        const book = await Book.findOne({ 
          _id: id, 
          userId: user._id 
        }).select('-pdfData');
        
        if (!book) return null;
        
        return {
          ...book.toObject(),
          id: book._id.toString(),
        };
      } catch (error) {
        console.error('Book query error:', error);
        throw error;
      }
    },

    searchBooks: async (_, { query }, context) => {
      try {
        const user = await getAuthenticatedUser(context.req.headers);
        await connectDB();
        
        const books = await Book.find({
          userId: user._id,
          $text: { $search: query }
        }).select('-pdfData').sort({ createdAt: -1 });
        
        return books.map(book => ({
          ...book.toObject(),
          id: book._id.toString(),
        }));
      } catch (error) {
        console.error('Search books error:', error);
        throw error;
      }
    },
  },

  Mutation: {
    deleteBook: async (_, { id }, context) => {
      try {
        const user = await getAuthenticatedUser(context.req.headers);
        await connectDB();
        
        const result = await Book.findOneAndDelete({ 
          _id: id, 
          userId: user._id 
        });
        
        return !!result;
      } catch (error) {
        console.error('Delete book error:', error);
        throw error;
      }
    },

    updateBook: async (_, { id, input }, context) => {
      try {
        const user = await getAuthenticatedUser(context.req.headers);
        await connectDB();
        
        const book = await Book.findOneAndUpdate(
          { _id: id, userId: user._id },
          { ...input },
          { new: true, runValidators: true }
        ).select('-pdfData');
        
        if (!book) throw new Error('Book not found');
        
        return {
          ...book.toObject(),
          id: book._id.toString(),
        };
      } catch (error) {
        console.error('Update book error:', error);
        throw error;
      }
    },
  },
};
