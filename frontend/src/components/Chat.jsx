import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

export default function Chat({ messages, onSendMessage, playerName, title = 'LOBBY CHAT', placeholder = 'Type a message...' }) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="glass-panel chat-container">
      <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>{title}</span>
      </h3>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '2rem' }}>
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg) => {
            const isSystem = msg.sender === 'System';
            const isSelf = msg.sender === playerName;
            
            if (isSystem) {
              return (
                <div key={msg.id} className="chat-bubble system">
                  {msg.text}
                </div>
              );
            }

            return (
              <div key={msg.id} className={`chat-bubble ${isSelf ? 'self' : 'other'}`}>
                <div className="chat-sender">{msg.sender}</div>
                <div>{msg.text}</div>
                <div className="chat-time">{msg.time}</div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          className="glass-input"
          placeholder={placeholder}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          maxLength={100}
        />
        <button type="submit" className="glass-button btn-primary" style={{ padding: '0.85rem' }}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
