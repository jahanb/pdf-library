'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_BOOKS, SEARCH_BOOKS, DELETE_BOOK } from '../lib/queries';
import { useAuth } from './AuthProvider';
import UploadForm from './UploadForm';
import BookList from './BookList';
import SearchBar from './SearchBar';
import PDFViewer from './PDFViewer';
import LoadingSpinner from './LoadingSpinner';

export default function LibraryApp({ user }) {
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const { logout, checkAuth, token } = useAuth();

  const { data, loading, error, refetch } = useQuery(GET_BOOKS, {
    errorPolicy: 'all',
    onError: (error) => {
      console.error('Books query error:', error);
    }
  });
  
  const { data: searchData, loading: searchLoading } = useQuery(SEARCH_BOOKS, {
    variables: { query: searchQuery },
    skip: !searchQuery,
    errorPolicy: 'all'
  });

  const [deleteBook] = useMutation(DELETE_BOOK, {
    onCompleted: () => {
      refetch();
      setSelectedBook(null);
    },
    onError: (error) => {
      console.error('Delete error:', error);
      if (error.message.includes('Authentication') || error.message.includes('token')) {
        alert('Session expired. Please log in again.');
        handleLogout();
      } else {
        alert('Failed to delete book. Please try again.');
      }
    }
  });

  const books = searchQuery ? (searchData?.searchBooks || []) : (data?.books || []);

  const handleBookSelect = (book) => {
    setSelectedBook(book);
  };

  const handleBookDelete = async (bookId) => {
    try {
      await deleteBook({ variables: { id: bookId } });
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const handleBookUpdate = () => {
    refetch();
    if (selectedBook) {
      const updatedBook = books.find(book => book.id === selectedBook.id);
      if (updatedBook) {
        setSelectedBook(updatedBook);
      }
    }
  };

  const handleUploadSuccess = () => {
    setShowUpload(false);
    refetch();
  };

  const handleLogout = () => {
    logout();
    setSelectedBook(null);
    setSearchQuery('');
    setShowUpload(false);
  };

  const handleRetry = async () => {
    try {
      if (token) {
        await checkAuth(token);
      }
      refetch();
    } catch (error) {
      console.error('Retry failed:', error);
      handleLogout();
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <LoadingSpinner size="large" />
        <p>Loading your library...</p>
      </div>
    );
  }

  if (error) {
    console.error('LibraryApp error:', error);
    
    // Check for authentication-related errors
    const isAuthError = error.message.includes('Authentication') || 
                       error.message.includes('token') || 
                       error.message.includes('Unauthorized') ||
                       error.graphQLErrors?.some(err => 
                         err.message.includes('Authentication') || 
                         err.message.includes('token')
                       );

    if (isAuthError) {
      return (
        <div className="error">
          <h2>Session Expired</h2>
          <p>Your session has expired. Please log in again to access your library.</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleRetry}>
              Retry
            </button>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="error">
        <h2>Error loading books</h2>
        <p>{error.message}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => refetch()}>
            Try Again
          </button>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <div className="header-left">
          <h1>📚 Digital Library</h1>
        </div>
        <div className="header-info">
          <span className="user-welcome">
            Welcome, <strong>{user.fullName}</strong>!
          </span>
          <div className="header-actions">
            <button 
              className="btn btn-primary"
              onClick={() => setShowUpload(!showUpload)}
              title="Upload a new PDF book"
            >
              {showUpload ? '❌ Cancel' : '📚 Add Book'}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handleLogout}
              title="Sign out of your account"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        {showUpload && (
          <div className="upload-section">
            <UploadForm onSuccess={handleUploadSuccess} />
          </div>
        )}

        <div className="content">
          <div className="sidebar">
            <div className="sidebar-header">
              <h3>Your Library</h3>
              <span className="book-count">{books.length} book{books.length !== 1 ? 's' : ''}</span>
            </div>
            
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
              loading={searchLoading}
            />
            
            <BookList
              books={books}
              selectedBook={selectedBook}
              onBookSelect={handleBookSelect}
              onBookDelete={handleBookDelete}
              onBookUpdate={handleBookUpdate}
            />
          </div>

          <div className="main-content">
            {selectedBook ? (
              <PDFViewer book={selectedBook} />
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📖</div>
                <h2>Welcome to your Digital Library, {user.fullName}!</h2>
                <p>Select a book from the list to start reading</p>
                {books.length === 0 ? (
                  <div className="empty-library">
                    <p><strong>Your library is empty.</strong></p>
                    <p>Upload your first PDF book to get started!</p>
                    {!showUpload && (
                      <button 
                        className="btn btn-primary"
                        onClick={() => setShowUpload(true)}
                        style={{ marginTop: '20px' }}
                      >
                        📚 Upload Your First Book
                      </button>
                    )}
                  </div>
                ) : searchQuery ? (
                  <div className="no-search-results">
                    <p>No books found for "{searchQuery}"</p>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear Search
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
