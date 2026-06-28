import React, { useState, useEffect } from 'react';
import { Award, ArrowLeft, RotateCcw, HelpCircle } from 'lucide-react';

const generateBingoBoard = () => {
  const getRandUnique = (min, max, count) => {
    const nums = [];
    while (nums.length < count) {
      const r = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!nums.includes(r)) nums.push(r);
    }
    // Mix them up so they aren't strictly sorted, but keeping them columns is nice.
    return nums;
  };

  const colB = getRandUnique(1, 15, 5);
  const colI = getRandUnique(16, 30, 5);
  const colN = getRandUnique(31, 45, 5);
  const colG = getRandUnique(46, 60, 5);
  const colO = getRandUnique(61, 75, 5);

  const grid = [];
  for (let r = 0; r < 5; r++) {
    const row = [];
    row.push(colB[r]);
    row.push(colI[r]);
    row.push(r === 2 ? 'FREE' : colN[r]);
    row.push(colG[r]);
    row.push(colO[r]);
    grid.push(row);
  }
  return grid;
};

export default function Bingo({ gameState, players, currentPlayer, onCallNumber, onClaimWin, onResetGame }) {
  const { calledNumbers, currentTurn, status, winner } = gameState;
  const [board, setBoard] = useState([]);
  const [lineCount, setLineCount] = useState(0);

  // Generate board once on mount
  useEffect(() => {
    setBoard(generateBingoBoard());
  }, []);

  const host = players.find(p => p.role === 'P1');
  const guest = players.find(p => p.role === 'P2');
  const isMyTurn = currentTurn === currentPlayer.id;

  // Helper to check if a number is marked (either FREE or in calledNumbers)
  const isMarked = (num) => {
    if (num === 'FREE') return true;
    return calledNumbers.includes(num);
  };

  // Recalculate completed lines whenever calledNumbers or board changes
  useEffect(() => {
    if (board.length === 0) return;

    let lines = 0;

    // Check rows
    for (let r = 0; r < 5; r++) {
      let complete = true;
      for (let c = 0; c < 5; c++) {
        if (!isMarked(board[r][c])) {
          complete = false;
          break;
        }
      }
      if (complete) lines++;
    }

    // Check columns
    for (let c = 0; c < 5; c++) {
      let complete = true;
      for (let r = 0; r < 5; r++) {
        if (!isMarked(board[r][c])) {
          complete = false;
          break;
        }
      }
      if (complete) lines++;
    }

    // Diagonal 1
    let diag1 = true;
    for (let i = 0; i < 5; i++) {
      if (!isMarked(board[i][i])) {
        diag1 = false;
        break;
      }
    }
    if (diag1) lines++;

    // Diagonal 2
    let diag2 = true;
    for (let i = 0; i < 5; i++) {
      if (!isMarked(board[i][4 - i])) {
        diag2 = false;
        break;
      }
    }
    if (diag2) lines++;

    setLineCount(lines);
  }, [calledNumbers, board]);

  const handleCellClick = (num) => {
    if (status !== 'playing' || !isMyTurn || num === 'FREE') return;
    if (calledNumbers.includes(num)) return;
    onCallNumber(num);
  };

  const handleClaimBingo = () => {
    if (lineCount < 5) return;
    onClaimWin(board);
  };

  const lastCalledNumber = calledNumbers[calledNumbers.length - 1];
  const isIWinner = winner === currentPlayer.id;

  const getWinnerName = () => {
    const winningPlayer = players.find(p => p.id === winner);
    return winningPlayer ? winningPlayer.name : 'Unknown';
  };

  return (
    <div className="fade-in app-container" style={{ maxWidth: '850px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
          <Award size={22} style={{ color: 'var(--color-primary)' }} />
          Bingo Duel
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

      <div className="bingo-layout">
        
        {/* Left Side: Boards */}
        <div>
          {/* Status Indicators */}
          <div className="status-bar" style={{ marginBottom: '1rem' }}>
            <div className={`turn-indicator ${isMyTurn && status === 'playing' ? 'active' : ''}`}>
              {status === 'playing' ? (
                isMyTurn ? "Your Turn: Select a number on your board!" : "Opponent is picking..."
              ) : (
                "Game Over"
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Lines: <span style={{ fontWeight: 800, color: lineCount >= 5 ? 'var(--color-success)' : 'var(--color-primary)' }}>{lineCount}/5</span>
              </span>
            </div>
          </div>

          {/* Bingo Grid */}
          <div style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
            <div className="bingo-header-letters">
              <span className="bingo-header-letter">B</span>
              <span className="bingo-header-letter">I</span>
              <span className="bingo-header-letter">N</span>
              <span className="bingo-header-letter">G</span>
              <span className="bingo-header-letter">O</span>
            </div>

            <div className="bingo-grid">
              {board.map((row, rIdx) => 
                row.map((num, cIdx) => {
                  const marked = isMarked(num);
                  const isLastCalled = num === lastCalledNumber;
                  const isFree = num === 'FREE';
                  const cellClass = `bingo-cell ${marked ? 'marked' : ''} ${isFree ? 'free-space' : ''} ${isLastCalled ? 'last-called' : ''}`;
                  
                  return (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => handleCellClick(num)}
                      disabled={status !== 'playing' || !isMyTurn || marked || isFree}
                      className={cellClass}
                    >
                      {num}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Claim Bingo Action Button */}
          {status === 'playing' && (
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <button
                onClick={handleClaimBingo}
                disabled={lineCount < 5}
                className="glass-button btn-success"
                style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  fontSize: '1.2rem', 
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  animation: lineCount >= 5 ? 'pulse 1s infinite' : 'none',
                  boxShadow: lineCount >= 5 ? '0 0 25px rgba(16, 185, 129, 0.6)' : 'none'
                }}
              >
                CLAIM BINGO!
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Game Info Panel / Call List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Last Called number callout */}
          <div className="glass-panel" style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)' }}>
            <h3 style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              LAST CALLED NUMBER
            </h3>
            <div style={{ 
              fontSize: '3.5rem', 
              fontWeight: 800, 
              color: lastCalledNumber ? 'var(--color-secondary)' : 'rgba(255,255,255,0.05)',
              textShadow: lastCalledNumber ? '0 0 15px var(--color-secondary-glow)' : 'none',
              lineHeight: 1
            }}>
              {lastCalledNumber || '--'}
            </div>
          </div>

          {/* Scores Panel */}
          <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.75rem' }}>SCORES</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#fff' }}>{host?.name}</span>
                <span style={{ fontWeight: 800, color: 'var(--color-secondary)' }}>{host?.score || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#fff' }}>{guest?.name}</span>
                <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{guest?.score || 0}</span>
              </div>
            </div>
          </div>

          {/* Numbers list called */}
          <div className="glass-panel" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '180px' }}>
            <h3 style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.25rem' }}>
              CALLED NUMBERS ({calledNumbers.length})
            </h3>
            <div style={{ 
              flexGrow: 1, 
              overflowY: 'auto', 
              display: 'flex', 
              flexWrap: 'wrap', 
              alignContent: 'flex-start',
              gap: '4px',
              paddingTop: '0.5rem'
            }}>
              {calledNumbers.length === 0 ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>No numbers called yet.</span>
              ) : (
                calledNumbers.map((num, i) => (
                  <span 
                    key={i} 
                    style={{ 
                      fontSize: '0.8rem', 
                      background: 'rgba(255,255,255,0.06)', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      color: 'var(--color-text)',
                      fontWeight: 600
                    }}
                  >
                    {num}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* GameOver Modal Overlay */}
      {status === 'won' && (
        <div className="modal-overlay">
          <div className="glass-panel-heavy modal-content">
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 800, 
              marginBottom: '1rem',
              color: isIWinner ? 'var(--color-success)' : 'var(--color-warning)',
              textShadow: isIWinner ? '0 0 15px var(--color-success-glow)' : '0 0 15px var(--color-warning-glow)'
            }}>
              {isIWinner ? "BINGO!" : "DEFEAT"}
            </h2>
            
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
              {isIWinner 
                ? "Excellent! You claimed 5 lines and won this round!" 
                : `${getWinnerName()} completed 5 lines first and won this round.`
              }
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={onResetGame} className="glass-button btn-primary" style={{ width: '100%' }}>
                <RotateCcw size={18} />
                PLAY AGAIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
