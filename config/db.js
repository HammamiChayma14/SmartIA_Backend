import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(" MongoDB Connecté");
  } catch (error) {
    console.error("Erreur MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
