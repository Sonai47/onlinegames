import React, { useState } from 'react';
import { Gamepad2, Plus, ArrowRight } from 'lucide-react';

export default function Home({ onCreateRoom, onJoinRoom, error }) {
  const [nickname, setNickname] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [shakeInput, setShakeInput] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      triggerShake();
      return;
    }
    onCreateRoom(nickname.trim());
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!nickname.trim() || !roomCodeInput.trim()) {
      triggerShake();
      return;
    }
    onJoinRoom(roomCodeInput.trim().toUpperCase(), nickname.trim());
  };

  const triggerShake = () => {
    setShakeInput(true);
    setTimeout(() => setShakeInput(false), 400);
  };

  return (
    <div className="fade-in" style={{ maxWidth: '500px', margin: '3rem auto', width: '100%' }}>
      <div className="header-brand">
        <h1>ARCADE ROOMS</h1>
        <p>Play with friends in private game rooms</p>
      </div>

      <div className={`glass-panel-heavy ${shakeInput ? 'shake' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-secondary)' }}>
            CHOOSE YOUR NICKNAME
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="glass-input"
              placeholder="e.g., StarLord"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={15}
            />
          </div>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-warning)', borderRadius: '10px', color: 'var(--color-warning)', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-glass)' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          {/* Create Room Option */}
          <button onClick={handleCreate} className="glass-button btn-primary" style={{ width: '100%' }}>
            <Plus size={20} />
            CREATE NEW ROOM
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
            <span style={{ flexGrow: 1, borderTop: '1px solid var(--border-glass)' }}></span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>OR</span>
            <span style={{ flexGrow: 1, borderTop: '1px solid var(--border-glass)' }}></span>
          </div>

          {/* Join Room Option */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              type="text"
              className="glass-input"
              placeholder="ENTER 6-CHARACTER ROOM CODE"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value)}
              maxLength={6}
              style={{ textAlign: 'center', letterSpacing: '0.15em', fontWeight: 700 }}
            />
            <button onClick={handleJoin} className="glass-button btn-secondary" style={{ width: '100%' }}>
              JOIN ROOM
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
