import React, { useState } from 'react';
import { Copy, Check, Users, ShieldAlert, Play, LogOut, Grid, Award, AlignLeft } from 'lucide-react';
import Chat from './Chat';

export default function Lobby({ 
  roomCode, 
  players, 
  currentPlayer, 
  selectedGame, 
  onSelectGame, 
  onToggleReady, 
  onLeaveRoom,
  messages,
  onSendMessage
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const opponent = players.find(p => p.id !== currentPlayer.id);
  const isReady = currentPlayer.ready;

  // Games description
  const gamesList = [
    {
      id: 'ttt',
      name: 'Tic Tac Toe',
      icon: <Grid size={24} style={{ color: 'var(--color-secondary)' }} />,
      desc: 'Classic 3x3 grid. Align three X or O markers to win. Quick, simple, and strategic.',
    },
    {
      id: 'bingo',
      name: 'Bingo Duel',
      icon: <Award size={24} style={{ color: 'var(--color-primary)' }} />,
      desc: '5x5 grids. Call out numbers sequentially. First to match 5 horizontal, vertical, or diagonal lines wins.',
    },
    {
      id: 'word',
      name: 'Secret Word',
      icon: <AlignLeft size={24} style={{ color: 'var(--color-success)' }} />,
      desc: 'One player writes a secret word & hint, the other guesses letter-by-letter. Giver watches live.',
    }
  ];

  return (
    <div className="fade-in app-container">
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>Game Room</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Wait for your opponent, choose a game, and ready up!</p>
        </div>
        
        {/* Room Code Badge */}
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 1.25rem', borderRadius: '14px', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>ROOM CODE</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-secondary)', letterSpacing: '0.05em' }}>{roomCode}</span>
          </div>
          <button 
            onClick={handleCopyCode} 
            className="glass-button" 
            style={{ padding: '0.4rem', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.05)' }}
            title="Copy Code"
          >
            {copied ? <Check size={16} style={{ color: 'var(--color-success)' }} /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      <div className="lobby-container">
        {/* Left Side: Game details & Players */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Players Status Panel */}
          <div className="glass-panel" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', marginBottom: '1.25rem', color: '#fff' }}>
              <Users size={18} />
              PLAYERS IN ROOM ({players.length}/2)
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {players.map((p) => {
                const isLocal = p.id === currentPlayer.id;
                return (
                  <div 
                    key={p.id} 
                    className="glass-panel" 
                    style={{ 
                      padding: '1rem', 
                      borderRadius: '14px', 
                      background: isLocal ? 'rgba(168, 85, 247, 0.05)' : 'rgba(0,0,0,0.15)',
                      border: isLocal ? '1px solid rgba(168, 85, 247, 0.2)' : '1px solid var(--border-glass)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>
                        {p.name} {isLocal && <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-primary)' }}>(You)</span>}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                        {p.role === 'P1' ? 'HOST' : 'GUEST'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Score: {p.score}</span>
                      <span className={`ready-badge ${p.ready ? 'is-ready' : 'not-ready'}`}>
                        {p.ready ? 'Ready' : 'Not Ready'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Waiting Slot if only 1 player */}
              {players.length < 2 && (
                <div 
                  className="glass-panel" 
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '14px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    borderStyle: 'dashed', 
                    borderColor: 'var(--border-glass-bright)',
                    background: 'none'
                  }}
                >
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Waiting for opponent...</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', fontWeight: 600, animation: 'pulse 1.5s infinite' }}>Share room code to invite!</span>
                </div>
              )}
            </div>
          </div>

          {/* Game Selection Panel */}
          <div className="glass-panel">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: '#fff' }}>SELECT GAME</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {gamesList.map((game) => {
                const isSelected = selectedGame === game.id;
                return (
                  <div 
                    key={game.id} 
                    onClick={() => players.length === 2 && onSelectGame(game.id)}
                    className="glass-panel"
                    style={{ 
                      padding: '1rem 1.25rem', 
                      borderRadius: '14px',
                      cursor: players.length === 2 ? 'pointer' : 'not-allowed',
                      opacity: players.length === 2 ? 1 : 0.6,
                      background: isSelected ? 'rgba(6, 182, 212, 0.05)' : 'rgba(255, 255, 255, 0.01)',
                      border: isSelected ? '1px solid var(--color-secondary)' : '1px solid var(--border-glass)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ 
                      padding: '0.5rem', 
                      borderRadius: '10px', 
                      background: isSelected ? 'var(--color-secondary-glow)' : 'rgba(255,255,255,0.02)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      {game.icon}
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <h4 style={{ fontWeight: 700, color: '#fff', fontSize: '1rem', marginBottom: '0.15rem' }}>{game.name}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: '1.2' }}>{game.desc}</p>
                    </div>
                    {isSelected && (
                      <div style={{ 
                        width: '10px', 
                        height: '10px', 
                        borderRadius: '50%', 
                        background: 'var(--color-secondary)',
                        boxShadow: '0 0 10px var(--color-secondary)'
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={onLeaveRoom} 
              className="glass-button btn-danger" 
              style={{ flexGrow: 1, padding: '1rem' }}
            >
              <LogOut size={20} />
              LEAVE ROOM
            </button>

            <button 
              onClick={() => onToggleReady(!isReady)}
              disabled={players.length < 2 || !selectedGame}
              className={`glass-button ${isReady ? 'btn-success' : 'btn-primary'}`} 
              style={{ flexGrow: 2, padding: '1rem' }}
            >
              <Play size={20} />
              {players.length < 2 
                ? 'WAITING FOR OPPONENT...' 
                : !selectedGame 
                  ? 'SELECT A GAME ABOVE' 
                  : isReady 
                    ? 'CANCEL READY' 
                    : 'READY TO PLAY'}
            </button>
          </div>

        </div>

        {/* Right Side: Chat System */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Chat 
            messages={messages} 
            onSendMessage={onSendMessage} 
            playerName={currentPlayer.name} 
          />
        </div>
      </div>
    </div>
  );
}
