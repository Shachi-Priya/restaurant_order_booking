// server/config/mongodb.js
const mongoose = require("mongoose");

// Prefer env var; otherwise fallback (move this to .env.local for security)
const MONGODB_URI =
  "mongodb+srv://blackandyellow:blackandyellow@cluster0.g5jujct.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

const connectMongo = async () => {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "blackandyelow",
      // Add any options you need here
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectMongo;
