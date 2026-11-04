import mongoose from 'mongoose';
import dns from 'node:dns';

const connectDB = async () => {
  try {
    // Use Google DNS for MongoDB SRV lookup
    dns.setServers(['8.8.8.8', '8.8.4.4']);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log('MongoDB Connected Successfully!');
    console.log(`Database Host: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);

    return conn;
  } catch (error) {
    console.error('MongoDB Connection Failed:', error.message);
    throw error;
  }
};

export default connectDB;