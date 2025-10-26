// src/App.jsx
import React, { useState } from "react";
import "./styles.css";
import InputBar from "./components/InputBar";

export default function App() {
  const [messages, setMessages] = useState([]);

  return (
    <div className="app">
      <div className="chat-wrapper">
        <header className="chat-header">
          <h1>Sentient</h1>
          <p>Converse intelligently, anytime.</p>
        </header>

        <div className="chat-body">
          {messages.length === 0 ? (
            <div className="welcome">
              <h2>👋 Hey Sadiq!</h2>
              <p>Ask me anything or type “/help” to get started.</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`bubble ${msg.role}`}>
                {msg.text}
              </div>
            ))
          )}
        </div>

        <InputBar setMessages={setMessages} />
      </div>
    </div>
  );
}
