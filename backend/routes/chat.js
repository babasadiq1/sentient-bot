const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// In-memory session store: { sessionId: [{role, text, time}, ...] }
// Note: ephemeral. Use DB for persistence in production.
const sessions = {};
const MAX_MEM_MESSAGES = 10;

const DOBBY_URL_1 = process.env.DOBBY_API_URL_1;
const DOBBY_KEY_1 = process.env.DOBBY_API_KEY_1;
const DOBBY_URL_2 = process.env.DOBBY_API_URL_2;
const DOBBY_KEY_2 = process.env.DOBBY_API_KEY_2;

// Helper: append to session
function appendToSession(sessionId, role, text) {
  if (!sessions[sessionId]) sessions[sessionId] = [];
  sessions[sessionId].push({ role, text, time: new Date().toISOString() });
  if (sessions[sessionId].length > MAX_MEM_MESSAGES) sessions[sessionId].shift();
}

router.post('/', async (req, res) => {
  try {
    let { sessionId, message } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });
    if (!sessionId) sessionId = uuidv4();

    // Save user message
    appendToSession(sessionId, 'user', message);

    // Build a compact conversation string for Dobby model 1
    const convoForModel = sessions[sessionId].map(m => `${m.role}: ${m.text}`).join('\n');

    // ---------- Call Dobby API 2 (analysis/enrichment) ----------
    // Example: we send user message for analysis to enrich it (topics, sentiment, tags).
    let enrichment = {};
    if (DOBBY_URL_2 && DOBBY_KEY_2) {
      try {
        const r2 = await axios.post(
          DOBBY_URL_2,
          { text: message, context: convoForModel },
          { headers: { Authorization: `Bearer ${DOBBY_KEY_2}`, 'Content-Type': 'application/json' }, timeout: 10000 }
        );
        enrichment = r2.data || {};
      } catch (err) {
        // don't block the main flow — keep enrichment empty
        console.warn('Dobby API 2 error:', err.message || err.toString());
      }
    }

    // Add enrichment data into system prompt to guide Dobby API 1
    const systemGuide = `You are Sentient — helpful, concise, and slightly mysterious. Use any enrichment provided: ${JSON.stringify(enrichment)}`;

    // ---------- Call Dobby API 1 (primary chat) ----------
    let replyText = 'Sorry, the bot failed to produce a response.';
    if (DOBBY_URL_1 && DOBBY_KEY_1) {
      const payload = {
        prompt: `${systemGuide}\n\nConversation:\n${convoForModel}\nAssistant:`,
        max_tokens: 512,
        temperature: 0.8
        // adapt fields to actual Dobby API contract
      };

      const r1 = await axios.post(DOBBY_URL_1, payload, {
        headers: { Authorization: `Bearer ${DOBBY_KEY_1}`, 'Content-Type': 'application/json' },
        timeout: 20000
      });
      // Adapt to expected response shape; try common keys
      if (r1.data) {
        if (r1.data.text) replyText = r1.data.text;
        else if (r1.data.output) replyText = typeof r1.data.output === 'string' ? r1.data.output : JSON.stringify(r1.data.output);
        else replyText = JSON.stringify(r1.data).slice(0, 2000);
      }
    } else {
      replyText = 'Dobby API keys not configured. Please set DOBBY_API_KEY_1 and DOBBY_API_URL_1.';
    }

    // Save assistant reply
    appendToSession(sessionId, 'assistant', replyText);

    // Return struct: sessionId so frontend reuses it
    return res.json({ sessionId, reply: replyText, enrichment });
  } catch (err) {
    console.error('chat error', err);
    return res.status(500).json({ error: 'internal_server_error', detail: err.message || String(err) });
  }
});

router.get('/session/:id', (req, res) => {
  const id = req.params.id;
  return res.json({ sessionId: id, messages: sessions[id] || [] });
});

module.exports = router;
