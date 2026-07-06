const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DATABASE_NAME || 'SentinelAI';

  if (!uri) {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      message: 'Database connection failed: MONGODB_URI environment variable is not defined.'
    }));
    process.exit(1);
  }

  // Connection options for pooling & automatic reconnection
  const options = {
    dbName: dbName,
    maxPoolSize: 10,  // Connection pooling: max 10 concurrent sockets
    minPoolSize: 2,   // Connection pooling: keep at least 2 sockets open
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 5000, // Timeout for finding a server (reconnect check)
  };

  try {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      message: `Connecting to database: ${dbName}...`
    }));

    await mongoose.connect(uri, options);

    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      message: `Database connected successfully: ${dbName}`
    }));
  } catch (err) {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      message: `Database connection error: ${err.message}`,
      stack: err.stack
    }));
    // Retry connection after 5 seconds for transient failures
    setTimeout(connectDB, 5000);
  }
};

// Monitor connection events for reconnection/disconnects
mongoose.connection.on('disconnected', () => {
  console.warn(JSON.stringify({
    level: 'warn',
    timestamp: new Date().toISOString(),
    message: 'MongoDB disconnected. Mongoose will automatically attempt to reconnect on next operation.'
  }));
});

mongoose.connection.on('reconnected', () => {
  console.log(JSON.stringify({
    level: 'info',
    timestamp: new Date().toISOString(),
    message: 'MongoDB reconnected successfully.'
  }));
});

mongoose.connection.on('error', (err) => {
  console.error(JSON.stringify({
    level: 'error',
    timestamp: new Date().toISOString(),
    message: `MongoDB runtime error: ${err.message}`
  }));
});

module.exports = connectDB;
