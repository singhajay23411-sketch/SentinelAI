require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Import models to register schemas and trigger collection/index creation
require('./models/User');
require('./models/ApkScan');
require('./models/ApkReport');
require('./models/ScanHistory');
require('./models/FlaggedApp');
require('./models/ThreatIntelligence');

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint displaying connection state
app.get('/health', (req, res) => {
  const mongooseState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  res.json({
    status: 'running',
    database: states[mongooseState] || 'unknown',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // 7. Verify the database connection during application startup
  await connectDB();

  app.listen(PORT, () => {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      message: `SentinelAI Node.js Backend Server running on port ${PORT}`
    }));
  });
};

startServer();
