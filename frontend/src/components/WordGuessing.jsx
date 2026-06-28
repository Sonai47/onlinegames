import React, { useState } from 'react';
import { AlignLeft, ArrowLeft, RotateCcw, Heart, Send } from 'lucide-react';

export default function WordGuessing({ gameState, players, currentPlayer, onSetupWord, onGuessLetter, onResetGame }) {
  const { giverId, guesserId, word, hint, guessedLetters, wrongGuesses, status } = gameState;
  const [secretInput, setSecretInput] = useState('');
  const [hintInput, setHintInput] = useState('');
  const [error, setError] = useState('');

  const isWriter = currentPlayer.id === giverId;
  const isGuesser = currentPlayer.id === guesserId;

  const host = players.find(p => p.role === 'P1');
  const guest = players.find(p => p.role === 'P2');

  const handleWordSetup = (e) => {
    e.preventDefault();
    const cleanWord = secretInput.trim().toUpperCase();
    const cleanHint = hintInput.trim();

    if (!cleanWord || !/^[A-Z\s]+$/.test(cleanWord)) {
      setError('Word must only contain letters and spaces.');
      return;
    }
    if (cleanWord.length < 3 || cleanWord.length > 15) {
      setError('Word length must be between 3 and 15 characters.');
      return;
    }
    if (!cleanHint) {
      setError('Please provide a hint.');
      return;
    }

    setError('');
    onSetupWord(cleanWord, cleanHint);
  };

  const handleKeyboardClick = (letter) => {
    if (status !== 'playing' || !isGuesser || guessedLetters.includes(letter)) return;
    onGuessLetter(letter);
  };

  // Generate word representation
  const renderWordProgress = () => {
    return word.split('').map((char, index) => {
      const isSpace = char === ' ';
      const isRevealed = guessedLetters.includes(char) || isSpace;
      return (
        <span 
          key={index} 
          className={`word-blank ${isRevealed ? 'revealed' : ''}`}
          style={{ borderBottom: isSpace ? 'none' : undefined, width: isSpace ? '20px' : undefined }}
        >
          {isRevealed ? char : ''}
        </span>
      );
    });
  };

  // Hearts calculation
  const totalLives = 6;
  const livesRemaining = totalLives - wrongGuesses;
  const renderHearts = () => {
    const hearts = [];
    for (let i = 0; i < totalLives; i++) {
      const spent = i >= livesRemaining;
      hearts.push(
        <Heart 
          key={i} 
          size={24} 
          fill={spent ? 'none' : 'var(--color-warning)'} 
          className={`attempt-heart ${spent ? 'spent' : ''}`} 
        />
      );
    }
    return hearts;
  };

  // Virtual keyboard buttons
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const getWinnerName = () => {
    if (status === 'won') {
      const winnerPlayer = players.find(p => p.id === guesserId);
      return winnerPlayer ? winnerPlayer.name : 'Guesser';
    }
    if (status === 'lost') {
      const winnerPlayer = players.find(p => p.id === giverId);
      return winnerPlayer ? winnerPlayer.name : 'Writer';
    }
    return '';
  };

  const isIWinner = (status === 'won' && isGuesser) || (status === 'lost' && isWriter);

  return (
    <div className="fade-in app-container" style={{ maxWidth: '750px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
          <AlignLeft size={22} style={{ color: 'var(--color-success)' }} />
          Secret Word
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

      {/* Role Assignment Badge */}
      <div className="status-bar">
        <div style={{ fontWeight: 600 }}>
          ROLE: <span style={{ color: isWriter ? 'var(--color-primary)' : 'var(--color-secondary)' }}>
            {isWriter ? 'THE WRITER (Giving Word)' : 'THE GUESSER (Solving Word)'}
          </span>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Word Master: {players.find(p => p.id === giverId)?.name}
        </div>
      </div>

      {/* STAGE 1: Wait for word / Submit word */}
      {status === 'waiting_for_word' && (
        <div className="glass-panel" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '2rem' }}>
          {isWriter ? (
            <form onSubmit={handleWordSetup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#fff', textAlign: 'center', marginBottom: '0.5rem' }}>
                Set the Secret Word & Hint
              </h3>

              {error && (
                <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-warning)', borderRadius: '10px', color: 'var(--color-warning)', fontSize: '0.85rem', textAlign: 'center' }}>
                  {error}
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  SECRET WORD (letters and spaces only)
                </label>
                <input 
                  type="password" 
                  className="glass-input" 
                  placeholder="e.g., GRAVITY" 
                  value={secretInput} 
                  onChange={(e) => setSecretInput(e.target.value.replace(/[^A-Za-z\s]/gi, ''))}
                  maxLength={15}
                  style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  HINT FOR YOUR OPPONENT
                </label>
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="e.g., Force pulling things down to Earth" 
                  value={hintInput} 
                  onChange={(e) => setHintInput(e.target.value)}
                  maxLength={80}
                />
              </div>

              <button type="submit" className="glass-button btn-primary" style={{ padding: '1rem', marginTop: '0.5rem' }}>
                <Send size={18} />
                SUBMIT SECRET WORD
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
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
                The Writer is choosing a word and a hint. Get ready!
              </p>
            </div>
          )}
        </div>
      )}

      {/* STAGE 2: Game playing (Word blanks, keyboard) */}
      {status === 'playing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Main game board */}
          <div className="glass-panel" style={{ textAlign: 'center', position: 'relative' }}>
            {/* Lives Remaining */}
            <div className="attempts-container">
              {renderHearts()}
            </div>

            {/* Word Progress Display */}
            <div className="word-blanks-container">
              {renderWordProgress()}
            </div>

            {/* Hint Box */}
            <div style={{ 
              background: 'rgba(0,0,0,0.2)', 
              padding: '1rem', 
              borderRadius: '12px', 
              border: '1px solid var(--border-glass)',
              display: 'inline-block',
              maxWidth: '90%',
              margin: '0 auto'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: 700, display: 'block', marginBottom: '0.2rem', letterSpacing: '0.05em' }}>HINT</span>
              <span style={{ color: '#fff', fontSize: '1rem' }}>"{hint}"</span>
            </div>
          </div>

          {/* Interaction panel: Keyboard (Guesser) or Spectator stats (Writer) */}
          <div className="glass-panel" style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
            {isGuesser ? (
              <div>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 600, textAlign: 'center', marginBottom: '1rem', letterSpacing: '0.05em' }}>
                  CHOOSE A LETTER
                </h3>
                <div className="keyboard-grid">
                  {alphabet.map((letter) => {
                    const guessed = guessedLetters.includes(letter);
                    const inWord = word.includes(letter);
                    
                    let keyClass = 'keyboard-key';
                    if (guessed) {
                      keyClass += inWord ? ' correct' : ' incorrect';
                    }

                    return (
                      <button
                        key={letter}
                        disabled={guessed}
                        onClick={() => handleKeyboardClick(letter)}
                        className={keyClass}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--color-primary)', fontWeight: 700, marginBottom: '0.75rem' }}>
                  SPECTATOR MODE
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  The Guesser is solving your word. Watch their guesses in real time below!
                </p>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>GUESSES MADE BY OPPONENT</span>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', minHeight: '30px' }}>
                    {guessedLetters.length === 0 ? (
                      <span style={{ color: 'rgba(255,255,255,0.15)', fontStyle: 'italic', fontSize: '0.9rem' }}>No guesses made yet...</span>
                    ) : (
                      guessedLetters.map((letter, idx) => {
                        const correct = word.includes(letter);
                        return (
                          <span 
                            key={idx} 
                            style={{ 
                              background: correct ? 'var(--color-success-glow)' : 'var(--color-warning-glow)',
                              border: correct ? '1px solid var(--color-success)' : '1px solid var(--color-warning)',
                              color: '#fff',
                              fontWeight: 700,
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {letter}
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GameOver Modal Overlay */}
      {(status === 'won' || status === 'lost') && (
        <div className="modal-overlay">
          <div className="glass-panel-heavy modal-content">
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 800, 
              marginBottom: '1rem',
              color: isIWinner ? 'var(--color-success)' : 'var(--color-warning)',
              textShadow: isIWinner ? '0 0 15px var(--color-success-glow)' : '0 0 15px var(--color-warning-glow)'
            }}>
              {isIWinner ? "VICTORY!" : "DEFEAT"}
            </h2>
            
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', fontSize: '1.1rem' }}>
              {status === 'won' 
                ? (isGuesser 
                    ? "Fantastic! You successfully solved the secret word!" 
                    : "Amazing! The Guesser solved your word.")
                : (isGuesser 
                    ? "Out of guesses! You failed to solve the word." 
                    : "Excellent job! The Guesser ran out of lives.")
              }
            </p>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-glass)', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>SECRET WORD WAS</span>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-secondary)', letterSpacing: '0.1em' }}>{word}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={onResetGame} className="glass-button btn-primary" style={{ width: '100%' }}>
                <RotateCcw size={18} />
                PLAY NEXT ROUND (SWAP ROLES)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
