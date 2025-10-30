import express, { Request, Response } from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// 🧠 In-memory session store
const sessions: Record<string, { role: string; text: string; time: string }[]> = {};
const MAX_MEM_MESSAGES = 10;

// 🧩 Environment setup
const DOBBY_URL = process.env.DOBBY_API_URL || "https://api.fireworks.ai/inference/v1/chat/completions";
const DOBBY_KEY = process.env.DOBBY_API_KEY || "fw_3Zh1FnyFccSon94MkNxzruFD";
const DOBBY_MODEL =
  process.env.DOBBY_MODEL || "accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new";

// 💬 Helper: append message to a chat session
function appendToSession(sessionId: string, role: string, text: string) {
  if (!sessions[sessionId]) sessions[sessionId] = [];
  sessions[sessionId].push({ role, text, time: new Date().toISOString() });
  if (sessions[sessionId].length > MAX_MEM_MESSAGES) sessions[sessionId].shift();
}

// 📨 POST /api/chat — handle user messages
router.post("/", async (req: Request, res: Response) => {
  try {
    let { sessionId, message } = req.body;

    if (!message) return res.status(400).json({ error: "Message is required" });
    if (!sessionId) sessionId = uuidv4();

    appendToSession(sessionId, "user", message);

    const convo = sessions[sessionId].map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.text,
    }));

    const messages = [
      { role: "system", content: "You are Dobby, an intelligent, helpful, and concise assistant." },
      ...convo,
    ];

    const payload = {
      model: DOBBY_MODEL,
      max_tokens: 700,
      temperature: 0.8,
      messages,
    };

    // 🧾 Debug logging
    console.log("➡️ Sending request to:", DOBBY_URL);
    console.log("🔑 API Key:", DOBBY_KEY ? "✅ Loaded" : "❌ Missing");

    if (!DOBBY_URL || !DOBBY_KEY) {
      return res.status(500).json({ error: "Server misconfiguration: Missing DOBBY_URL or DOBBY_KEY" });
    }

    const response = await axios.post(DOBBY_URL, payload, {
      headers: {
        Authorization: `Bearer ${DOBBY_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 20000,
    });

    // 🧠 Extract assistant reply safely
    let reply =
      response.data?.choices?.[0]?.message?.content?.trim() ||
      response.data?.choices?.[0]?.text?.trim() ||
      response.data?.output_text?.trim() ||
      response.data?.generated_text?.trim() ||
      "";

    // fallback: if output is array
    if (!reply && Array.isArray(response.data?.output)) {
      try {
        const out = response.data.output[0];
        if (out?.content && Array.isArray(out.content)) {
          const t = out.content.find(
            (c: any) => c.type === "output_text" || c.type === "text"
          );
          if (t) reply = (t.text || t.payload || "").trim();
        }
      } catch {
        // ignore
      }
    }

    if (!reply) reply = "⚠️ No response from Dobby model.";

    appendToSession(sessionId, "assistant", reply);

    return res.json({ sessionId, reply });
  } catch (err: any) {
    console.error("❌ Chat error:", err.response?.data || err.message);
    return res.status(500).json({
      error: "Internal server error",
      detail: err.response?.data || err.message,
    });
  }
});

// 📜 GET /api/chat/session/:id — get chat history
router.get("/session/:id", (req: Request, res: Response) => {
  const sessionId = req.params.id;
  return res.json({ sessionId, messages: sessions[sessionId] || [] });
});

export default router;
