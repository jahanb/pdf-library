
'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';

export default function UploadForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    if (!token) {
      setError('Authentication token missing. Please log in again.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      console.log('Starting upload process...');
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      console.log('Form data:', formData);
      console.log('Token available:', !!token);

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('author', formData.author);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('pdf', file);

      console.log('Sending request to /api/upload...');

      const response = await fetch('/pdf/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      console.log('Upload response status:', response.status);
      console.log('Upload response headers:', [...response.headers.entries()]);

      const result = await response.json();
      console.log('Upload response data:', result);

      if (response.ok) {
        console.log('Upload successful!');
        setFormData({ title: '', author: '', description: '' });
        setFile(null);
        onSuccess();
      } else {
        console.error('Upload failed:', result.error);
        setError(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Network error during upload:', error);
      setError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      <h2>Upload New Book</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="author">Author *</label>
        <input
          id="author"
          type="text"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="form-group">
        <label htmlFor="pdf">PDF File *</label>
        <input
          id="pdf"
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
        {file && (
          <div className="file-info">
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            <br />
            Type: {file.type}
          </div>
        )}
      </div>

      <button 
        type="submit" 
        className="btn btn-primary"
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Upload Book'}
      </button>

      {/* Debug Info (remove in production) */}
      <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0', fontSize: '12px' }}>
        <strong>Debug Info:</strong><br />
        Token: {token ? 'Present' : 'Missing'}<br />
        File selected: {file ? 'Yes' : 'No'}<br />
        Form valid: {formData.title && formData.author && file ? 'Yes' : 'No'}
      </div>
    </form>
  );
}