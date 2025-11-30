import mongoose from "mongoose";

const DB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/invoice-system";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing MongoDB connection");
    return;
  }

  try {
    console.log("Attempting to connect to MongoDB:", DB_URI);
    const connection = await mongoose.connect(DB_URI);
    isConnected = true;
    console.log("Connected to MongoDB successfully");
    return connection;
  } catch (error: any) {
    console.error("Error connecting to MongoDB:", error.message);
    isConnected = false;
    throw new Error(`Database connection failed: ${error.message}`);
  }
};
