const mongoose = require('mongoose');

const FlaggedAppSchema = new mongoose.Schema({
  app_name: {
    type: String,
    required: [true, 'App name is required'],
    trim: true,
    index: true
  },
  developer: {
    type: String,
    default: 'Unknown'
  },
  package_name: {
    type: String,
    trim: true
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
  source: {
    type: String,
    required: [true, 'Source type is required'],
    enum: ['apk', 'playstore', 'manual', 'website']
  },
  status: {
    type: String,
    enum: ['active', 'investigating', 'resolved'],
    default: 'active',
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FlaggedApp', FlaggedAppSchema);
