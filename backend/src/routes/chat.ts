import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ reply: "⚠️ Message cannot be empty." });
  }

  try {
    // Temporary backend logic (you can connect AI later)
    const reply = `🤖 Dobby says: "${message}"`;

    res.json({ reply });
  } catch (error) {
    console.error("Chat route error:", error);
    res.status(500).json({ reply: "⚠️ Server error. Try again later." });
  }
});

export default router;
