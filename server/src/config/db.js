const mongoose = require('mongoose');
const { SKIP_DB_TEMP } = require('./flags');

const connectDB = async () => {
  if (SKIP_DB_TEMP) {
    console.warn('⚠️ Running with DB connection SKIPPED (SKIP_DB_TEMP=true) — using mock data, nothing persists.');
    return;
  }

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not set in environment variables');
    }

    await mongoose.connect(uri, {
      // Modern Mongoose 8 doesn't need these options but they don't hurt
      serverSelectionTimeoutMS: 5000,
    });

    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

module.exports = connectDB;