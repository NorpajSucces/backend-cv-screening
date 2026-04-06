// Job Posting schema
const mongoose = require('mongoose');

const jobPostingSchema = new mongoose.Schema({
  title: {
    type:     String,
    required: [true, 'Job title is required'],
    trim:     true,
  },
  aboutPosition: {
    type:     String,
    required: [true, 'Position summary is required'],
  },
  description: {
    type:     String,
    required: [true, 'Job description is required'],
  },
  requirements: {
    type:     String,
    required: [true, 'Requirements are required'],
  },
  location: {
    type:     String,
    required: [true, 'Location is required'],
    trim:     true,
  },
  employmentType: {
    type:     String,
    enum:     ['Full-time', 'Part-time', 'Internship'],
    required: [true, 'Employment type is required'],
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