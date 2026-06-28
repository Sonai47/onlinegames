import React from 'react';
import { Grid, ArrowLeft, RotateCcw } from 'lucide-react';

export default function TicTacToe({ gameState, players, currentPlayer, onMakeMove, onResetGame }) {
  const { board, currentTurn, status, winner, winningLine } = gameState;

  // Find players
  const host = players.find(p => p.role === 'P1');
  const guest = players.find(p => p.role === 'P2');
  const isMyTurn = currentTurn === currentPlayer.id;

  const handleCellClick = (index) => {
    if (status !== 'playing' || !isMyTurn || board[index] !== null) return;
    onMakeMove(index);
  };

  const getWinnerName = () => {
    const winningPlayer = players.find(p => p.id === winner);
    return winningPlayer ? winningPlayer.name : 'Unknown';
  };

  const isIWinner = winner === currentPlayer.id;

  return (
    <div className="fade-in app-container" style={{ maxWidth: '600px', margin: '1rem auto' }}>
      
      {/* Game Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
          <Grid size={22} style={{ color: 'var(--color-secondary)' }} />
          Tic Tac Toe
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

      {/* Scoreboard Panel */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>HOST</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>{host?.name}</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-secondary)' }}>{host?.score || 0}</div>
        </div>
        <div style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', fontWeight: 300 }}>VS</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>GUEST</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>{guest?.name}</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>{guest?.score || 0}</div>
        </div>
      </div>

      {/* Turn indicator */}
      <div className="status-bar">
        <div className={`turn-indicator ${isMyTurn && status === 'playing' ? 'active' : ''}`}>
          {status === 'playing' ? (
            isMyTurn ? "Your Turn (make a move!)" : "Opponent's turn..."
          ) : (
            "Game Over"
          )}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Playing as: <span style={{ fontWeight: 700, color: currentPlayer.role === 'P1' ? 'var(--color-secondary)' : 'var(--color-primary)' }}>
            {currentPlayer.role === 'P1' ? 'X' : 'O'}
          </span>
        </div>
      </div>

      {/* TTT Board Grid */}
      <div className="ttt-grid">
        {board.map((cell, index) => {
          const isWinningCell = winningLine && winningLine.includes(index);
          const cellClass = `ttt-cell ${cell ? 'occupied' : ''} ${isWinningCell ? 'winning-cell' : ''}`;
          
          return (
            <div 
              key={index} 
              className={cellClass} 
              onClick={() => handleCellClick(index)}
            >
              {cell && (
                <span className={`ttt-icon ${cell.toLowerCase()}`}>
                  {cell}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* GameOver Modal Overlay */}
      {status !== 'playing' && (
        <div className="modal-overlay">
          <div className="glass-panel-heavy modal-content">
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 800, 
              marginBottom: '1rem',
              color: status === 'draw' 
                ? 'var(--color-text)' 
                : isIWinner 
                  ? 'var(--color-success)' 
                  : 'var(--color-warning)',
              textShadow: status === 'draw'
                ? 'none'
                : isIWinner 
                  ? '0 0 15px var(--color-success-glow)' 
                  : '0 0 15px var(--color-warning-glow)'
            }}>
              {status === 'draw' ? "IT'S A DRAW!" : isIWinner ? "VICTORY!" : "DEFEAT"}
            </h2>
            
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
              {status === 'draw' 
                ? "Both of you played exceptionally well!" 
                : isIWinner 
                  ? "Congratulations, you won this round!" 
                  : `${getWinnerName()} won this round. Better luck next time!`
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
