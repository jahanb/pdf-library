
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';

export default function PDFViewer({ book }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');

  const { token } = useAuth();

  // Create authenticated PDF URL
  useEffect(() => {
    if (book && token) {
      // Create URL with token as query parameter for iframe
      const authenticatedUrl = `/api/pdf/${book.id}?token=${encodeURIComponent(token)}`;
      setPdfUrl(authenticatedUrl);
      setLoading(true);
      setError(false);
    }
  }, [book, token]);

  const handleLoad = () => setLoading(false);
  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const exitFullscreen = () => {
    setIsFullscreen(false);
  };

  // Download PDF with authentication
  const downloadPdf = async (e) => {
    e.preventDefault();
    
    if (!token) {
      alert('Authentication required for download');
      return;
    }

    try {
      const response = await fetch(`/api/pdf/${book.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = book.fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download PDF. Please try again.');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading PDF. Please try again.');
    }
  };

  // Open PDF in new tab with authentication
  const openInNewTab = async () => {
    if (!token) {
      alert('Authentication required');
      return;
    }

    try {
      const response = await fetch(`/api/pdf/${book.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        // Don't revoke URL immediately to allow the new tab to load
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      } else {
        alert('Failed to open PDF. Please try again.');
      }
    } catch (error) {
      console.error('Open in new tab error:', error);
      alert('Error opening PDF. Please try again.');
    }
  };

  // Keyboard shortcuts for fullscreen
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  if (!token) {
    return (
      <div className="pdf-viewer">
        <div className="pdf-error">
          <p>Authentication required to view PDF</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Regular PDF Viewer */}
      <div className="pdf-viewer">
        <div className="pdf-header">
          <h2>{book.title}</h2>
          <p className="author">by {book.author}</p>
          {book.description && <p className="description">{book.description}</p>}
          
          <div className="pdf-actions">
            <button 
              className="btn btn-primary"
              onClick={toggleFullscreen}
              title="Open in full screen mode"
            >
              📖 Full Screen
            </button>
            <button 
              className="btn btn-secondary"
              onClick={downloadPdf}
              title="Download PDF file"
            >
              📥 Download
            </button>
            <button 
              className="btn btn-secondary"
              onClick={openInNewTab}
              title="Open PDF in new tab"
            >
              🔗 New Tab
            </button>
          </div>
        </div>

        <div className="pdf-container">
          {loading && <div className="pdf-loading">Loading PDF...</div>}
          
          {error ? (
            <div className="pdf-error">
              <p>Unable to display PDF</p>
              <div className="pdf-error-actions">
                <button 
                  className="btn btn-primary"
                  onClick={toggleFullscreen}
                >
                  Try Full Screen
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={openInNewTab}
                >
                  Open in Browser
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={downloadPdf}
                >
                  Download
                </button>
              </div>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="pdf-frame"
              onLoad={handleLoad}
              onError={handleError}
              title={book.title}
            />
          ) : (
            <div className="pdf-loading">Preparing PDF...</div>
          )}
        </div>
      </div>

      {/* Full Screen Modal */}
      {isFullscreen && (
        <div className="pdf-fullscreen-overlay">
          <div className="pdf-fullscreen-header">
            <div className="pdf-fullscreen-info">
              <h3>{book.title}</h3>
              <span>by {book.author}</span>
            </div>
            <div className="pdf-fullscreen-actions">
              <span className="keyboard-hint">Press ESC to exit</span>
              <button 
                className="btn btn-small btn-secondary"
                onClick={downloadPdf}
                title="Download PDF"
              >
                📥
              </button>
              <button 
                className="btn btn-small btn-danger"
                onClick={exitFullscreen}
                title="Exit full screen"
              >
                ✕ Exit
              </button>
            </div>
          </div>
          
          <div className="pdf-fullscreen-container">
            {error ? (
              <div className="pdf-error">
                <h3>PDF Display Error</h3>
                <p>The PDF cannot be displayed in full screen mode.</p>
                <div className="pdf-error-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={openInNewTab}
                  >
                    Open in New Tab
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={downloadPdf}
                  >
                    Download PDF
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={exitFullscreen}
                  >
                    Back to Library
                  </button>
                </div>
              </div>
            ) : pdfUrl ? (
              <iframe
                src={pdfUrl}
                className="pdf-fullscreen-frame"
                title={`${book.title} - Full Screen`}
              />
            ) : (
              <div className="pdf-loading">Loading PDF...</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
