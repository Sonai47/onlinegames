import React, { useState, useEffect } from 'react';
import { AlignLeft, ArrowLeft, RotateCcw, HelpCircle, Trophy, Play, Frown } from 'lucide-react';
import Chat from './Chat';

export default function WordGuessing({ 
  gameState, 
  players, 
  currentPlayer, 
  onSetupWord, 
  onGuess, 
  onPassTurn,
  onResetGame,
  messages,
  onSendMessage
}) {
  const { category, status, playersData, currentTurn, winner } = gameState;
  const [wordInput, setWordInput] = useState('');
  const [guessInput, setGuessInput] = useState('');
  const [error, setError] = useState('');
  const [alphabetStatus, setAlphabetStatus] = useState({});

  useEffect(() => {
    if (status === 'setup') {
      setAlphabetStatus({});
    }
  }, [status]);

  const handleLetterClick = (letter) => {
    setAlphabetStatus(prev => {
      const current = prev[letter];
      let next;
      if (!current) {
        next = 'yes';
      } else if (current === 'yes') {
        next = 'no';
      } else {
        next = undefined;
      }
      return {
        ...prev,
        [letter]: next
      };
    });
  };

  if (!currentPlayer || !currentPlayer.id || !playersData || !playersData[currentPlayer.id]) {
    return (
      <div className="fade-in app-container" style={{ textAlign: 'center', marginTop: '5rem' }}>
        <div style={{ 
          border: '3px solid rgba(255,255,255,0.05)', 
          borderTopColor: 'var(--color-secondary)', 
          borderRadius: '50%', 
          width: '40px', 
          height: '40px', 
          margin: '0 auto 1.5rem',
          animation: 'spin 1s linear infinite'
        }} />
        <h3>Connecting to Match...</h3>
      </div>
    );
  }

  const myData = playersData[currentPlayer.id];
  const opponentId = Object.keys(playersData).find(id => id !== currentPlayer.id);
  const opponentData = playersData[opponentId];
  const opponentPlayer = players.find(p => p.id === opponentId);

  const isMyTurn = currentTurn === currentPlayer.id;

  const handleWordSubmit = (e) => {
    e.preventDefault();
    const cleanWord = wordInput.trim().toUpperCase();
    if (!cleanWord || !/^[A-Z]+$/.test(cleanWord)) {
      setError('Word must contain letters only (no spaces, numbers, or symbols).');
      return;
    }
    if (cleanWord.length < 3 || cleanWord.length > 12) {
      setError('Word must be between 3 and 12 letters.');
      return;
    }
    setError('');
    onSetupWord(cleanWord);
  };

  const handleGuessSubmit = (e) => {
    e.preventDefault();
    const cleanGuess = guessInput.trim().toUpperCase();
    if (!cleanGuess || !/^[A-Z]+$/.test(cleanGuess)) {
      setError('Guess must contain letters only.');
      return;
    }
    setError('');
    onGuess(cleanGuess);
    setGuessInput('');
  };

  const isIWinner = winner === currentPlayer.id;

  return (
    <div className="fade-in app-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Game Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
          <AlignLeft size={22} style={{ color: 'var(--color-success)' }} />
          Secret Word Duel
        </h2>
        <button 
          onClick={onResetGame} 
          className="glass-button" 
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        >
          <ArrowLeft size={16} />
          Lobby
        </button>
      </div>

      {/* STAGE 1: Setup Phase (Setting Secret Words) */}
      {status === 'setup' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          {myData.word === '' ? (
            <div className="glass-panel-heavy" style={{ maxWidth: '500px', width: '100%', padding: '2rem' }}>
              <form onSubmit={handleWordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>GAME SETUP</span>
                  <h3 style={{ fontSize: '1.5rem', color: '#fff', marginTop: '0.25rem' }}>Choose Your Secret Word</h3>
                </div>

                <div className="glass-panel" style={{ textAlign: 'center', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid var(--color-secondary-glow)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>CATEGORY</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-secondary)' }}>{category}</div>
                </div>

                {error && (
                  <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-warning)', borderRadius: '10px', color: 'var(--color-warning)', fontSize: '0.85rem', textAlign: 'center' }}>
                    {error}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                    SECRET WORD
                  </label>
                  <input  
                    className="glass-input" 
                    placeholder="Enter word..." 
                    value={wordInput} 
                    onChange={(e) => setWordInput(e.target.value.replace(/[^A-Za-z]/gi, ''))}
                    maxLength={12}
                    style={{ textTransform: 'uppercase', letterSpacing: '0.15em', textAlign: 'center', fontWeight: 700 }}
                  />
                </div>

                <button type="submit" className="glass-button btn-primary" style={{ padding: '1rem' }}>
                  <Play size={18} />
                  SUBMIT SECRET WORD
                </button>
              </form>
            </div>
          ) : (
            <div className="glass-panel-heavy" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ 
                border: '3px solid rgba(255,255,255,0.05)', 
                borderTopColor: 'var(--color-secondary)', 
                borderRadius: '50%', 
                width: '40px', 
                height: '40px', 
                margin: '0 auto 1.5rem',
                animation: 'spin 1s linear infinite'
              }} />
              <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>Waiting for opponent...</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                You chose: <span style={{ color: 'var(--color-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>{myData.word}</span>. 
                Waiting for {opponentPlayer?.name || 'opponent'} to choose their word.
              </p>
            </div>
          )}
        </div>
      )}

      {/* STAGE 2: Duel Phase (Playing) */}
      {status === 'playing' && (
        <div className="lobby-container">
          
          {/* Left Column: Game board & guessing console */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Status Panel */}
            <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', background: 'rgba(255, 255, 255, 0.01)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>CATEGORY</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-secondary)' }}>{category}</div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>YOUR SECRET WORD</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-success)', letterSpacing: '0.05em' }}>{myData.word}</div>
                </div>
              </div>
            </div>

            {/* Turn Announcement Bar */}
            <div className="status-bar">
              <div className={`turn-indicator ${isMyTurn ? 'active' : ''}`}>
                {isMyTurn 
                  ? "Your Turn: Ask questions in chat or make a guess! Click 'Pass Turn' when done." 
                  : `Waiting for ${opponentPlayer?.name || 'opponent'}'s turn...`}
              </div>
            </div>

            {/* Alphabet Tracker Box */}
            <div className="glass-panel" style={{ background: 'rgba(0,0,0,0.15)', padding: '1.25rem 1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlignLeft size={18} style={{ color: 'var(--color-success)' }} />
                Alphabet Tracker (Your Notes)
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                Click letters to mark them: <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>✔ (In Word)</span>, <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>✖ (Not In Word)</span>, or neutral.
              </p>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(42px, 1fr))', 
                gap: '0.5rem' 
              }}>
                {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => {
                  const status = alphabetStatus[letter];
                  return (
                    <button
                      key={letter}
                      onClick={() => handleLetterClick(letter)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        aspectRatio: '1',
                        borderRadius: '10px',
                        border: status === 'yes' 
                          ? '1px solid var(--color-success)' 
                          : status === 'no' 
                          ? '1px solid var(--color-warning)' 
                          : '1px solid var(--border-glass)',
                        background: status === 'yes'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : status === 'no'
                          ? 'rgba(239, 68, 68, 0.15)'
                          : 'rgba(255, 255, 255, 0.03)',
                        color: status === 'yes'
                          ? 'var(--color-success)'
                          : status === 'no'
                          ? 'var(--color-warning)'
                          : '#fff',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '1.1rem',
                        position: 'relative',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>{letter}</span>
                      {status === 'yes' && <span style={{ fontSize: '0.65rem', fontWeight: 'bold', marginTop: '2px' }}>✔</span>}
                      {status === 'no' && <span style={{ fontSize: '0.65rem', fontWeight: 'bold', marginTop: '2px' }}>✖</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Guess Console */}
            <div className="glass-panel" style={{ background: 'rgba(0,0,0,0.15)' }}>
              {isMyTurn ? (
                <form onSubmit={handleGuessSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HelpCircle size={18} style={{ color: 'var(--color-secondary)' }} />
                    Submit a Guess
                  </h3>
                  
                  {error && (
                    <div style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-warning)', borderRadius: '8px', color: 'var(--color-warning)', fontSize: '0.8rem', textAlign: 'center' }}>
                      {error}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      className="glass-input" 
                      placeholder={`Guess ${opponentPlayer?.name || 'opponent'}'s word...`}
                      value={guessInput}
                      onChange={(e) => setGuessInput(e.target.value.replace(/[^A-Za-z]/gi, ''))}
                      maxLength={12}
                      style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    />
                    <button type="submit" className="glass-button btn-secondary" style={{ flexShrink: 0 }}>
                      GUESS
                    </button>
                    <button 
                      type="button" 
                      onClick={onPassTurn} 
                      className="glass-button btn-primary"
                      style={{ background: 'rgba(168, 85, 247, 0.4)', flexShrink: 0 }}
                    >
                      PASS TURN
                    </button>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    💡 Tip: Ask questions in the chat to narrow down the word before making a guess!
                  </p>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', fontStyle: 'italic' }}>
                    Opponent's turn to guess/ask. You can talk and answer questions in the chat!
                  </p>
                </div>
              )}
            </div>

            {/* Guess History Logs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              
              {/* My Guesses list */}
              <div className="glass-panel" style={{ minHeight: '150px' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                  YOUR INCORRECT GUESSES
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {myData.guesses.length === 0 ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>None yet.</span>
                  ) : (
                    myData.guesses.map((g, idx) => (
                      <span key={idx} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-warning)' }}>
                        {g}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Opponent Guesses list */}
              <div className="glass-panel" style={{ minHeight: '150px' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                  OPPONENT'S INCORRECT GUESSES
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {opponentData.guesses.length === 0 ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>None yet.</span>
                  ) : (
                    opponentData.guesses.map((g, idx) => (
                      <span key={idx} style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-glass)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>
                        {g}
                      </span>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Chat integration */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Chat 
              messages={messages} 
              onSendMessage={onSendMessage} 
              playerName={currentPlayer.name} 
              title="GAME CHAT"
              placeholder={isMyTurn ? "Ask a question..." : "Answer the question..."}
            />
          </div>

        </div>
      )}

      {/* STAGE 3: Win Overlay */}
      {status === 'won' && (
        <div className="modal-overlay">
          <div className="glass-panel-heavy modal-content">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              {isIWinner ? (
                <Trophy size={60} style={{ color: 'var(--color-success)', filter: 'drop-shadow(0 0 10px var(--color-success-glow))' }} />
              ) : (
                <Frown size={60} style={{ color: 'var(--color-warning)', filter: 'drop-shadow(0 0 10px var(--color-warning-glow))' }} />
              )}
            </div>

            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 800, 
              marginBottom: '0.5rem',
              color: isIWinner ? 'var(--color-success)' : 'var(--color-warning)',
              textShadow: isIWinner ? '0 0 15px var(--color-success-glow)' : '0 0 15px var(--color-warning-glow)'
            }}>
              {isIWinner ? "VICTORY!" : "DEFEAT"}
            </h2>

            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
              {isIWinner 
                ? `Incredible! You correctly guessed that their word was "${opponentData.word}"!` 
                : `${opponentPlayer?.name || 'Opponent'} correctly guessed your word first.`
              }
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              <div className="glass-panel" style={{ padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Your Word:</span>
                <span style={{ fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>{myData.word}</span>
              </div>
              <div className="glass-panel" style={{ padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Opponent's Word:</span>
                <span style={{ fontWeight: 800, color: 'var(--color-secondary)', letterSpacing: '0.05em' }}>{opponentData.word}</span>
              </div>
            </div>

            <button onClick={onResetGame} className="glass-button btn-primary" style={{ width: '100%' }}>
              <RotateCcw size={18} />
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
