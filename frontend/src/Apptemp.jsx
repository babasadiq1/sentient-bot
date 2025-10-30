// src/App.jsx
import React, { useState } from "react";
import "./styles.css";
import InputBar from "./components/InputBar";

export default function App() {
  const [messages, setMessages] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Handle sending user message to backend
  const sendMessage = async (userText) => {
    const newMessage = { role: "user", text: userText };
    setMessages((prev) => [...prev, newMessage]);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();
      const botReply = { role: "bot", text: data.reply || "No response." };

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Failed to connect to backend." },
      ]);
      console.error(err);
    }
  };

  return (
    <div className="app">
      <div className="chat-wrapper">
        <header className="chat-header">
          <h1>Dobby Chatbot</h1>
          <p>Converse intelligently, anytime.</p>
        </header>

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

        {/* Input bar — send message */}
        <InputBar onSend={sendMessage} />

        {/* Footer credit */}
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
