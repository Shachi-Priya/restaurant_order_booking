// server/config/mongodb.js
const mongoose = require('mongoose');

// Prefer env var; otherwise fallback (move this to .env.local for security)
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://blackandyellow:blackandyellow@cluster0.g5jujct.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

// Auto-clear cache when mongoose disconnects so next request reconnects
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected — will reconnect on next request');
  cached.conn = null;
  cached.promise = null;
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err?.message || err);
  cached.conn = null;
  cached.promise = null;
});

const connectMongo = async () => {
  // If we already have a ready connection, verify it's still alive
  if (cached.conn) {
    const readyState = mongoose.connection.readyState;
    // 1 = connected, 2 = connecting
    if (readyState === 1) return cached.conn;
    if (readyState === 2) {
      // still connecting — wait for the existing promise
      cached.conn = await cached.promise;
      return cached.conn;
    }
    // 0 = disconnected, 3 = disconnecting — clear cache and reconnect
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: 'blackandyelow',
        serverSelectionTimeoutMS: 10000, // fail fast (10 s) instead of 30 s default
        socketTimeoutMS: 45000, // close idle sockets after 45 s
        heartbeatFrequencyMS: 10000, // check server health every 10 s
        maxPoolSize: 10,
      })
      .catch((err) => {
        // Clear cache so the next call retries instead of reusing a rejected promise
        cached.promise = null;
        cached.conn = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectMongo;
