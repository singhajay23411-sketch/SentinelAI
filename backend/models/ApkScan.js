const mongoose = require('mongoose');

const ApkScanSchema = new mongoose.Schema({
  scan_id: {
    type: String,
    required: [true, 'Scan ID is required'],
    unique: true,
    trim: true,
    index: true
  },
  file_name: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  file_size: {
    type: Number,
    required: [true, 'File size is required']
  },
  status: {
    type: String,
    enum: ['PENDING', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'],
    default: 'PENDING'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  current_stage: {
    type: String,
    default: 'Pending'
  },
  detail: {
    type: String,
    default: 'Waiting for file upload to start.'
  },
  hash: {
    type: String,
    trim: true,
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ApkScan', ApkScanSchema);
