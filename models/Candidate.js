// schema Kandidat
const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type:     String,
    required: [true, 'Nama wajib diisi'],
    trim:     true,
  },
  email: {
    type:     String,
    required: [true, 'Email wajib diisi'],
    lowercase: true,
    trim:     true,
  },
  phone: {
    type:     String,
    required: [true, 'Nomor HP wajib diisi'],
    trim:     true,
  },
  jobId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'JobPosting',
    required: true,
  },
  cvUrl: {
    type:     String,
    required: true,
  },
  aiScore: {
    type:    Number,
    min:     0,
    max:     100,
    default: null,
  },
  aiSummary: {
    type:    String,
    default: null,
  },
  aiStrengths: {
    type:    String,
    default: null,
  },
  aiWeaknesses: {
    type:    String,
    default: null,
  },
  aiFeedback: {
    type:    String,
    default: null,
  },
  status: {
    type:    String,
    enum:    ['pending', 'processed', 'advanced', 'rejected', 'failed'],
    default: 'pending',
  },
  appliedAt: {
    type:    Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Candidate', candidateSchema);