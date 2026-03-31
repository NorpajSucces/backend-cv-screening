// schema Job Posting
const mongoose = require('mongoose');

const jobPostingSchema = new mongoose.Schema({
  title: {
    type:     String,
    required: [true, 'Judul posisi wajib diisi'],
    trim:     true,
  },
  aboutPosition: {
    type:     String,
    required: [true, 'Ringkasan posisi wajib diisi'],
  },
  description: {
    type:     String,
    required: [true, 'Deskripsi pekerjaan wajib diisi'],
  },
  requirements: {
    type:     String,
    required: [true, 'Requirements wajib diisi'],
  },
  location: {
    type:     String,
    required: [true, 'Lokasi wajib diisi'],
    trim:     true,
  },
  employmentType: {
    type:     String,
    enum:     ['Full-time', 'Part-time', 'Internship'],
    required: [true, 'Tipe pekerjaan wajib diisi'],
  },
  status: {
    type:    String,
    enum:    ['open', 'closed'],
    default: 'open',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('JobPosting', jobPostingSchema);