import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config(); // Ensure environment variables are loaded

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit on failure
  }
};

export default connectDB;
