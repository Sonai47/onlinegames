import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Home from './components/Home';
import Lobby from './components/Lobby';
import TicTacToe from './components/TicTacToe';
import Bingo from './components/Bingo';
import WordGuessing from './components/WordGuessing';

// Detect socket server URL
const SOCKET_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : window.location.origin;

let socket;

export default function App() {
  const [screen, setScreen] = useState('HOME'); // HOME, LOBBY, GAME
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [gameType, setGameType] = useState(null); // ttt, bingo, word
  const [gameState, setGameState] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [infoAlert, setInfoAlert] = useState('');

  // 1. Establish socket connection
  useEffect(() => {
    socket = io(SOCKET_URL, { autoConnect: true });

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    // Handle room created
    socket.on('room_created', ({ roomCode, players }) => {
      setRoomCode(roomCode);
      setPlayers(players);
      const me = players.find(p => p.id === socket.id);
      setCurrentPlayer(me);
      setScreen('LOBBY');
      setError('');
    });

    // Handle room joined
    socket.on('room_joined', ({ roomCode, players, messages }) => {
      setRoomCode(roomCode);
      setPlayers(players);
      setMessages(messages);
      const me = players.find(p => p.id === socket.id);
      setCurrentPlayer(me);
      setScreen('LOBBY');
      setError('');
    });

    // Handle updates in player states (like ready flags)
    socket.on('players_updated', (updatedPlayers) => {
      setPlayers(updatedPlayers);
      if (socket.id) {
        const me = updatedPlayers.find(p => p.id === socket.id);
        setCurrentPlayer(me);
      }
    });

    // Receive message
    socket.on('chat_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Opponent left room
    socket.on('player_left', ({ players, message }) => {
      setPlayers(players);
      if (socket.id) {
        const me = players.find(p => p.id === socket.id);
        setCurrentPlayer(me);
      }
      setInfoAlert(message);
      setScreen('LOBBY');
      setGameState(null);
      setGameType(null);
      setTimeout(() => setInfoAlert(''), 5000);
    });

    // Game type selected in lobby
    socket.on('game_selected', ({ gameType, players }) => {
      setGameType(gameType);
      setPlayers(players);
      if (socket.id) {
        const me = players.find(p => p.id === socket.id);
        setCurrentPlayer(me);
      }
    });

    // Game starting (both ready)
    socket.on('game_started', ({ gameType, gameState }) => {
      setGameType(gameType);
      setGameState(gameState);
      setScreen('GAME');
    });

    // Game state updates (moves, marks, round setups)
    socket.on('game_state_updated', ({ gameState, players }) => {
      setGameState(gameState);
      setPlayers(players);
      if (socket.id) {
        const me = players.find(p => p.id === socket.id);
        setCurrentPlayer(me);
      }
    });

    // Game resets (replays, back to lobbies)
    socket.on('game_reset', (updatedPlayers) => {
      setGameState(null);
      setPlayers(updatedPlayers);
      if (socket.id) {
        const me = updatedPlayers.find(p => p.id === socket.id);
        setCurrentPlayer(me);
      }
      setScreen('LOBBY');
    });

    // Handle generic error responses
    socket.on('error_message', (msg) => {
      setError(msg);
      setTimeout(() => setError(''), 4000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // --- Actions ---
  const handleCreateRoom = (name) => {
    setNickname(name);
    socket.emit('create_room', { nickname: name });
  };

  const handleJoinRoom = (code, name) => {
    setNickname(name);
    socket.emit('join_room', { roomCode: code, nickname: name });
  };

  const handleLeaveRoom = () => {
    // Reconnect socket to wipe room links cleanly
    socket.disconnect();
    socket.connect();
    // Clear local hooks
    setScreen('HOME');
    setRoomCode('');
    setPlayers([]);
    setCurrentPlayer(null);
    setGameType(null);
    setGameState(null);
    setMessages([]);
    setError('');
  };

  const handleSendMessage = (text) => {
    socket.emit('send_message', { roomCode, text });
  };

  const handleSelectGame = (type) => {
    socket.emit('select_game', { roomCode, gameType: type });
  };

  const handleToggleReady = (ready) => {
    socket.emit('toggle_ready', { roomCode, ready });
  };

  // Tic Tac Toe emitters
  const handleTTTMove = (cellIndex) => {
    socket.emit('ttt_move', { roomCode, cellIndex });
  };

  const handleTTTReset = () => {
    socket.emit('ttt_reset', { roomCode });
  };

  // Bingo emitters
  const handleBingoCallNumber = (number) => {
    socket.emit('bingo_call_number', { roomCode, number });
  };

  const handleBingoClaimWin = (board) => {
    socket.emit('bingo_claim_win', { roomCode, board });
  };

  const handleBingoReset = () => {
    socket.emit('bingo_reset', { roomCode });
  };

  // Word guessing emitters
  const handleWordSetup = (word) => {
    socket.emit('word_setup', { roomCode, word });
  };

  const handleWordGuess = (guess) => {
    socket.emit('word_guess', { roomCode, guess });
  };

  const handleWordPassTurn = () => {
    socket.emit('word_pass_turn', { roomCode });
  };

  const handleWordReset = () => {
    socket.emit('word_reset', { roomCode });
  };

  return (
    <>
      {/* Visual background blobs */}
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      {/* Info notifications */}
      {infoAlert && (
        <div style={{ 
          position: 'fixed', 
          top: '20px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          padding: '0.85rem 2rem', 
          background: 'rgba(168, 85, 247, 0.2)', 
          border: '1px solid var(--color-primary)', 
          borderRadius: '12px', 
          color: '#fff', 
          fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          zIndex: 1000,
          backdropFilter: 'blur(10px)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {infoAlert}
        </div>
      )}

      {/* Screen Router */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {screen === 'HOME' && (
          <Home 
            onCreateRoom={handleCreateRoom} 
            onJoinRoom={handleJoinRoom} 
            error={error} 
          />
        )}

        {screen === 'LOBBY' && (
          <Lobby
            roomCode={roomCode}
            players={players}
            currentPlayer={currentPlayer}
            selectedGame={gameType}
            onSelectGame={handleSelectGame}
            onToggleReady={handleToggleReady}
            onLeaveRoom={handleLeaveRoom}
            messages={messages}
            onSendMessage={handleSendMessage}
          />
        )}

        {screen === 'GAME' && gameState && (
          <>
            {gameType === 'ttt' && (
              <TicTacToe
                gameState={gameState}
                players={players}
                currentPlayer={currentPlayer}
                onMakeMove={handleTTTMove}
                onResetGame={handleTTTReset}
              />
            )}

            {gameType === 'bingo' && (
              <Bingo
                gameState={gameState}
                players={players}
                currentPlayer={currentPlayer}
                onCallNumber={handleBingoCallNumber}
                onClaimWin={handleBingoClaimWin}
                onResetGame={handleBingoReset}
              />
            )}

            {gameType === 'word' && (
              <WordGuessing
                gameState={gameState}
                players={players}
                currentPlayer={currentPlayer}
                onSetupWord={handleWordSetup}
                onGuess={handleWordGuess}
                onPassTurn={handleWordPassTurn}
                onResetGame={handleWordReset}
                messages={messages}
                onSendMessage={handleSendMessage}
              />
            )}
          </>
        )}
      </main>
    </>
  );
}
