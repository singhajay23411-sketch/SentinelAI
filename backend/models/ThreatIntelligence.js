const mongoose = require('mongoose');

const ThreatIntelligenceSchema = new mongoose.Schema({
  high_risk_count: {
    type: Number,
    default: 0
  },
  medium_risk_count: {
    type: Number,
    default: 0
  },
  total_evaluated: {
    type: Number,
    default: 0
  },
  top_threats: [{
    title: { type: String, required: true },
    count: { type: Number, default: 0 }
  }],
  newly_detected: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ThreatIntelligence', ThreatIntelligenceSchema);
