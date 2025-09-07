
'use client';

import { useState } from 'react';
import EditBookModal from './EditBookModal';
import ConfirmDialog from './ConfirmDialog';

export default function BookList({ books, selectedBook, onBookSelect, onBookDelete, onBookUpdate }) {
  const [editingBook, setEditingBook] = useState(null);
  const [deletingBook, setDeletingBook] = useState(null);

  const handleEditClick = (e, book) => {
    e.stopPropagation();
    setEditingBook(book);
  };

  const handleDeleteClick = (e, book) => {
    e.stopPropagation();
    setDeletingBook(book);
  };

  const handleConfirmDelete = () => {
    if (deletingBook) {
      onBookDelete(deletingBook.id);
      setDeletingBook(null);
    }
  };

  return (
    <>
      <div className="book-list">
        <h3>Books ({books.length})</h3>
        
        {books.length === 0 ? (
          <div className="empty-list">No books found</div>
        ) : (
          <div className="books">
            {books.map((book) => (
              <div 
                key={book.id} 
                className={`book-item ${selectedBook?.id === book.id ? 'selected' : ''}`}
                onClick={() => onBookSelect(book)}
              >
                <div className="book-info">
                  <h4>{book.title}</h4>
                  <p className="author">by {book.author}</p>
                  {book.description && (
                    <p className="description">{book.description}</p>
                  )}
                  <div className="book-meta">
                    <span className="file-size">
                      {(book.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <span className="upload-date">
                      {new Date(book.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="book-actions">
                  <button 
                    className="action-btn edit-btn"
                    onClick={(e) => handleEditClick(e, book)}
                    title="Edit book"
                  >
                    ✏️
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={(e) => handleDeleteClick(e, book)}
                    title="Delete book"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EditBookModal
        book={editingBook}
        isOpen={!!editingBook}
        onClose={() => setEditingBook(null)}
        onSuccess={onBookUpdate}
      />

      <ConfirmDialog
        isOpen={!!deletingBook}
        title="Delete Book"
        message={`Are you sure you want to delete "${deletingBook?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingBook(null)}
      />
    </>
  );
}
