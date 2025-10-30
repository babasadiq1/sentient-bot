import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import chatRouter from "./routes/chat"; // routes/chat.ts

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Allow all origins (for Vercel frontend)
app.use(
  cors({
    origin: "*", // or replace "*" with your frontend URL for better security
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// ✅ Parse JSON bodies
app.use(express.json());

// ✅ Chat route
app.use("/chat", chatRouter);

// ✅ Root route (for Render/Vercel status check)
app.get("/", (_req, res) => {
  res.send("✅ Dobby backend is live and ready!");
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Dobby backend running on port ${PORT}`);
  console.log("Environment variables:");
  console.log({
    PORT: process.env.PORT,
    DOBBY_URL: process.env.DOBBY_API_URL,
    DOBBY_KEY: process.env.DOBBY_API_KEY,
    DOBBY_MODEL: process.env.DOBBY_MODEL,
  });
});
