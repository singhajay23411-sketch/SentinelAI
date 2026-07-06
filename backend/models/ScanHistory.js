const mongoose = require('mongoose');

const ScanHistorySchema = new mongoose.Schema({
  scan_id: {
    type: String,
    required: [true, 'Scan ID is required'],
    trim: true,
    index: true
  },
  app_name: {
    type: String,
    required: [true, 'App name is required'],
    trim: true
  },
  developer: {
    type: String,
    default: 'Unknown'
  },
  scan_type: {
    type: String,
    required: [true, 'Scan type is required'],
    enum: ['apk', 'playstore', 'manual', 'website']
  },
  risk_score: {
    type: Number,
    required: [true, 'Risk score is required'],
    min: 0,
    max: 100
  },
  risk_level: {
    type: String,
    required: [true, 'Risk level is required']
  },
  summary: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ScanHistory', ScanHistorySchema);
