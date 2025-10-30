import express, { Request, Response } from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

const sessions: Record<string, { role: string; text: string; time: string }[]> = {};
const MAX_MEM_MESSAGES = 10;

const DOBBY_URL = process.env.DOBBY_API_URL || "https://api.fireworks.ai/inference/v1/chat/completions";
const DOBBY_KEY = process.env.DOBBY_API_KEY || "fw_3Zh1FnyFccSon94MkNxzruFD";
const DOBBY_MODEL = process.env.DOBBY_MODEL || "accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new";

function appendToSession(sessionId: string, role: string, text: string) {
  if (!sessions[sessionId]) sessions[sessionId] = [];
  sessions[sessionId].push({ role, text, time: new Date().toISOString() });
  if (sessions[sessionId].length > MAX_MEM_MESSAGES) sessions[sessionId].shift();
}

router.post("/", async (req, res) => {
  // logic

  try {
    let { sessionId, message } = req.body;

    if (!message) return res.status(400).json({ error: "Message is required" });
    if (!sessionId) sessionId = uuidv4();

    appendToSession(sessionId, "user", message);


    const convo = sessions[sessionId].map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.text,
    }));

    const messages = [
      { role: "system", content: "You are helpful, concise, and insightful." },
      ...convo,
    ];

    const payload = {
      model: DOBBY_MODEL,
      max_tokens: 700,
      temperature: 0.8,
      messages,
    };

    console.log("DOBBY_URL:", DOBBY_URL);
console.log("DOBBY_KEY:", DOBBY_KEY ? "✅ loaded" : "❌ missing");

if (!DOBBY_URL || !DOBBY_KEY) {
  return res.status(500).json({ error: "DOBBY_URL or DOBBY_KEY missing" });
}

    const r = await axios.post(DOBBY_URL!, payload, {
      headers: {
        Authorization: `Bearer ${DOBBY_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 20000,
    });

    let reply: string | undefined;

    reply = r.data?.choices?.[0]?.message?.content?.trim();

    if (!reply) reply = r.data?.choices?.[0]?.text?.trim();
    if (!reply) reply = r.data?.output_text?.trim();
    if (!reply && Array.isArray(r.data?.output)) {
      try {
        const out = r.data.output[0];
        if (out?.content && Array.isArray(out.content)) {
          const t = out.content.find((c: any) => c.type === "output_text" || c.type === "text");
          if (t) reply = (t.text || t.payload || "").trim();
        }
      } catch (e) {
      }
    }

    if (!reply) reply = (r.data?.generated_text || r.data?.text || "").trim();

    if (!reply) reply = "⚠️ No response from model.";

    appendToSession(sessionId, "assistant", reply);

    return res.json({ sessionId, reply });
  } catch (err: any) {
    console.error("Chat error:", err.response?.data || err.message);
    return res.status(500).json({
      error: "Internal server error",
      detail: err.response?.data || err.message,
    });
  }
});

router.get("/session/:id", (req: Request, res: Response) => {
  const sessionId = req.params.id;
  return res.json({ sessionId, messages: sessions[sessionId] || [] });
});

export default router;
