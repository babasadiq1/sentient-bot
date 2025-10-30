import React, { useState } from "react";

export default function InputBar({ setMessages }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Automatically switches between local + deployed backend
  const API_URL = import.meta.env.VITE_API_URL || "https://sentient-bot.onrender.com/chat";

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
    const res = await fetch("https://<your-backend-name>.onrender.com/chat", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply || "⚠️ No response" },
      ]);
    } catch (err) {
      console.error("Fetch error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "⚠️ Server not responding" },
      ]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="input-bar" style={{ display: "flex", marginTop: 8 }}>
      <textarea
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        rows={1}
        style={{
          flex: 1,
          padding: 8,
          borderRadius: 6,
          border: "1px solid #ccc",
          resize: "none",
        }}
      />
      <button
        onClick={sendMessage}
        disabled={loading || !input.trim()}
        style={{
          marginLeft: 8,
          padding: "8px 16px",
          borderRadius: 6,
          backgroundColor: "#4A90E2",
          color: "#fff",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  );
}
