import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import connectDb from "./config/database.js";
import { cloudinaryConnect } from "./config/cloudinary.js";

import userRoutes from "./Routes/user.js";
import contactRoutes from "./Routes/Contact.js";
import profileRoutes from "./Routes/Profile.js";
import fileRoutes from "./Routes/File.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://nit-assist.vercel.app",
    "https://nit-assist-server.vercel.app",
    "https://nit-assist-frontend.vercel.app",
    "https://nitassist.vercel.app",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.use("/files", express.static(path.join(__dirname, "files")));

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/upload", fileRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/contact", contactRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/health", async (req, res) => {
  try {
    // Simple database connection test
    const mongoose = await import('mongoose');
    if (mongoose.default.connection.readyState === 1) {
      res.json({ 
        status: "healthy", 
        database: "connected",
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({ 
        status: "unhealthy", 
        database: "disconnected",
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({ 
      status: "error", 
      database: "error",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

const startServer = async () => {
  try {
    await connectDb();
    await cloudinaryConnect();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
    // http://localhost:5001/api/v1/
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

