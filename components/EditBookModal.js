
'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_BOOK } from '../lib/queries';

export default function EditBookModal({ book, isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: book?.title || '',
    author: book?.author || '',
    description: book?.description || '',
  });
  const [error, setError] = useState('');

  const [updateBook, { loading }] = useMutation(UPDATE_BOOK, {
    onCompleted: () => {
      onSuccess();
      onClose();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await updateBook({
        variables: {
          id: book.id,
          input: formData,
        },
      });
    } catch (error) {
      setError('Failed to update book');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="modal-header">
            <h2>Edit Book</h2>
            <button 
              type="button" 
              className="close-btn"
              onClick={onClose}
            >
              ×
            </button>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="edit-title">Title *</label>
            <input
              id="edit-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-author">Author *</label>
            <input
              id="edit-author"
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-description">Description</label>
            <textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}