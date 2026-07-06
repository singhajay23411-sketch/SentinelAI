const mongoose = require('mongoose');

const ApkReportSchema = new mongoose.Schema({
  scan_id: {
    type: String,
    required: [true, 'Scan ID is required'],
    unique: true,
    trim: true,
    index: true
  },
  sha256: {
    type: String,
    required: [true, 'SHA256 hash is required'],
    unique: true,
    trim: true,
    index: true
  },
  app_name: {
    type: String,
    required: [true, 'App name is required'],
    trim: true
  },
  risk_score: {
    type: Number,
    required: [true, 'Risk score is required'],
    min: 0,
    max: 100
  },
  threat_level: {
    type: String,
    required: [true, 'Threat level is required'],
    enum: ['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
  },
  metadata: {
    file_name: { type: String, required: true },
    file_size: { type: String, required: true },
    package_name: { type: String, required: true },
    min_sdk: { type: Number, required: true },
    target_sdk: { type: Number, required: true },
    certificate: { type: String, required: true },
    obfuscation: { type: String, required: true }
  },
  permissions: {
    requested: [{ type: String }],
    critical_violations: [{ type: String }]
  },
  reasons: [{ type: String }],
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ApkReport', ApkReportSchema);
