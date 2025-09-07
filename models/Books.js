
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  pdfData: {
    type: Buffer,
    required: true
  },
  pdfContentType: {
    type: String,
    required: true,
    default: 'application/pdf'
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  // Add user association
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for search functionality (user-specific)
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.models.Book || mongoose.model('Book', bookSchema);
