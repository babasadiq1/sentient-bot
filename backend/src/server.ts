// backend/src/server.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import chatRouter from "./routes/chat.js"; // ✅ use .js for Render build compatibility

// 🧩 Load environment variables
dotenv.config();

// 🚀 Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// 🌍 CORS setup
app.use(
  cors({
    origin: "*", // 🔒 Replace with your frontend URL in production (e.g. "https://sentient.vercel.app")
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 🧠 Middleware
app.use(express.json());

// 💬 Chat route
app.use("/api/chat", chatRouter);

// 🏠 Root route (for health check)
app.get("/", (_req, res) => {
  res.status(200).json({
    status: "✅ Dobby backend is live and running smoothly",
    endpoints: {
      chat: "/api/chat",
      health: "/",
    },
    poweredBy: "🧠 Sentient x web3sadiq",
  });
});

// 🧾 404 fallback (optional)
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// 🧱 Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("❌ Server error:", err.message || err);
  res.status(500).json({ error: "Internal server error", details: err.message || err });
});

// ⚙️ Start server
app.listen(PORT, () => {
  console.log(`🚀 Dobby backend running on port ${PORT}`);
  console.log("🌐 Environment configuration:");
  console.table({
    PORT: process.env.PORT,
    DOBBY_URL: process.env.DOBBY_API_URL,
    DOBBY_KEY: process.env.DOBBY_API_KEY ? "✅ Loaded" : "❌ Missing",
    DOBBY_MODEL: process.env.DOBBY_MODEL,
  });
});
