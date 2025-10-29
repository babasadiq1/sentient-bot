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

        {/* Input bar */}
        <InputBar setMessages={setMessages} />

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
