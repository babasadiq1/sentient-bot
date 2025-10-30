import React, { useState } from "react";
import "./styles.css";
import InputBar from "./components/InputBar";

export default function App() {
  const [messages, setMessages] = useState([]);

  // ✅ Reads from your .env file or defaults to deployed backend
  const API_URL = import.meta.env.VITE_API_URL || "https://sentient-bot.onrender.com/chat";

  // Handle sending user message to backend
  const sendMessage = async (userText) => {
    if (!userText.trim()) return;

    const newMessage = { role: "user", text: userText };
    setMessages((prev) => [...prev, newMessage]);

    try {
      const res = await fetch(`${API_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();
      const botReply = { role: "assistant", text: data.reply || "⚠️ No response." };

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error("Backend error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "⚠️ Failed to connect to backend." },
      ]);
    }
  };

  return (
    <div className="app">
      <div className="chat-wrapper">
        {/* ✅ Header */}
        <header className="chat-header">
          <h1>Dobby Chatbot</h1>
          <p>Converse intelligently, anytime.</p>
        </header>

        {/* ✅ Chat Body */}
        <div className="chat-body">
          {messages.length === 0 ? (
            <div className="welcome">
              <h2>👋 Hey there!</h2>
              <p>Ask me anything to get started.</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`bubble ${msg.role}`}>
                {msg.text}
              </div>
            ))
          )}
        </div>

        {/* ✅ Input Bar */}
        <InputBar setMessages={setMessages} />

        {/* ✅ Footer */}
        <footer className="footer-credit">
          <p>
            made by{" "}
            <a
              href="https://x.com/web3sadiq"
              target="_blank"
              rel="noopener noreferrer"
              className="web3-link"
            >
              web3sadiq
            </a>{" "}
            with ❤️
          </p>
        </footer>
      </div>
    </div>
  );
}
