import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log('✅ Database Connected');
    });

    await mongoose.connect(process.env.MONGODB_URI); // DB name already in .env
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
};
