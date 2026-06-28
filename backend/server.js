const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Serve static files from the React app in production
app.use(express.static(path.join(__dirname, '../frontend/dist')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Game and Lobby Rooms State
const rooms = {};

// Helper to generate a room code
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Helper to calculate Tic-Tac-Toe winner
function calculateTTTWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: lines[i] };
    }
  }
  return null;
}

// Helper to verify Bingo win
function verifyBingoWin(board, calledNumbers) {
  // board is a 5x5 array where board[r][c] is the number (or 'FREE')
  // We check if a player has 5 completed rows, columns, or diagonals.
  // FREE is always considered marked.
  const isMarked = (num) => num === 'FREE' || calledNumbers.includes(num);
  let completedLines = 0;

  // Check rows
  for (let r = 0; r < 5; r++) {
    let rowComplete = true;
    for (let c = 0; c < 5; c++) {
      if (!isMarked(board[r][c])) {
        rowComplete = false;
        break;
      }
    }
    if (rowComplete) completedLines++;
  }

  // Check columns
  for (let c = 0; c < 5; c++) {
    let colComplete = true;
    for (let r = 0; r < 5; r++) {
      if (!isMarked(board[r][c])) {
        colComplete = false;
        break;
      }
    }
    if (colComplete) completedLines++;
  }

  // Diagonal 1 (top-left to bottom-right)
  let diag1Complete = true;
  for (let i = 0; i < 5; i++) {
    if (!isMarked(board[i][i])) {
      diag1Complete = false;
      break;
    }
  }
  if (diag1Complete) completedLines++;

  // Diagonal 2 (top-right to bottom-left)
  let diag2Complete = true;
  for (let i = 0; i < 5; i++) {
    if (!isMarked(board[i][4 - i])) {
      diag2Complete = false;
      break;
    }
  }
  if (diag2Complete) completedLines++;

  return completedLines >= 5;
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // 1. Create Room
  socket.on('create_room', ({ nickname }) => {
    let roomCode = generateRoomCode();
    while (rooms[roomCode]) {
      roomCode = generateRoomCode();
    }

    rooms[roomCode] = {
      code: roomCode,
      players: [{
        id: socket.id,
        name: nickname || 'Host',
        role: 'P1',
        ready: false,
        score: 0
      }],
      gameType: null,
      gameState: null,
      messages: []
    };

    socket.join(roomCode);
    socket.emit('room_created', {
      roomCode,
      players: rooms[roomCode].players
    });
    console.log(`Room created: ${roomCode} by ${nickname}`);
  });

  // 2. Join Room
  socket.on('join_room', ({ roomCode, nickname }) => {
    const code = roomCode.toUpperCase();
    const room = rooms[code];

    if (!room) {
      return socket.emit('error_message', 'Room not found.');
    }

    if (room.players.length >= 2) {
      return socket.emit('error_message', 'Room is full.');
    }

    const player = {
      id: socket.id,
      name: nickname || 'Guest',
      role: 'P2',
      ready: false,
      score: 0
    };

    room.players.push(player);
    socket.join(code);

    // Notify all players in room
    io.to(code).emit('room_joined', {
      roomCode: code,
      players: room.players,
      messages: room.messages
    });

    // Send system message
    const systemMsg = {
      id: Math.random().toString(),
      sender: 'System',
      text: `${player.name} joined the room!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    room.messages.push(systemMsg);
    io.to(code).emit('chat_message', systemMsg);

    console.log(`User ${nickname} joined room ${code}`);
  });

  // 3. Chat Messages
  socket.on('send_message', ({ roomCode, text }) => {
    const room = rooms[roomCode];
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    const message = {
      id: Math.random().toString(),
      sender: player.name,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    room.messages.push(message);
    io.to(roomCode).emit('chat_message', message);
  });

  // 4. Select Game type
  socket.on('select_game', ({ roomCode, gameType }) => {
    const room = rooms[roomCode];
    if (!room) return;

    room.gameType = gameType;
    room.gameState = null; // reset state
    // Reset players ready status
    room.players.forEach(p => p.ready = false);

    io.to(roomCode).emit('game_selected', { gameType, players: room.players });
  });

  // 5. Ready toggle
  socket.on('toggle_ready', ({ roomCode, ready }) => {
    const room = rooms[roomCode];
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    player.ready = ready;
    io.to(roomCode).emit('players_updated', room.players);

    // Auto-start game if all players (2 players) are ready
    if (room.players.length === 2 && room.players.every(p => p.ready)) {
      initializeGame(roomCode);
    }
  });

  // 6. Game Initialization Logic
  function initializeGame(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;

    const p1 = room.players[0];
    const p2 = room.players[1];
    const firstTurn = Math.random() < 0.5 ? p1.id : p2.id;

    if (room.gameType === 'ttt') {
      room.gameState = {
        board: Array(9).fill(null),
        currentTurn: firstTurn,
        status: 'playing', // playing, won, draw
        winner: null,
        winningLine: null
      };
    } else if (room.gameType === 'bingo') {
      room.gameState = {
        calledNumbers: [],
        currentTurn: firstTurn,
        status: 'playing',
        winner: null
      };
    } else if (room.gameType === 'word') {
      // Word guessing requires role setup first.
      // We assign Giver and Guesser roles. Giver starts by writing the word.
      const giverId = firstTurn;
      const guesserId = room.players.find(p => p.id !== giverId).id;
      room.gameState = {
        giverId,
        guesserId,
        word: '',
        hint: '',
        guessedLetters: [],
        wrongGuesses: 0,
        status: 'waiting_for_word' // waiting_for_word, playing, won, lost
      };
    }

    io.to(roomCode).emit('game_started', {
      gameType: room.gameType,
      gameState: room.gameState
    });
  }

  // --- TIC TAC TOE EVENT HANDLERS ---
  socket.on('ttt_move', ({ roomCode, cellIndex }) => {
    const room = rooms[roomCode];
    if (!room || room.gameType !== 'ttt' || !room.gameState) return;

    const state = room.gameState;
    if (state.status !== 'playing') return;
    if (state.currentTurn !== socket.id) return;
    if (state.board[cellIndex] !== null) return;

    const activePlayer = room.players.find(p => p.id === socket.id);
    const marker = activePlayer.role === 'P1' ? 'X' : 'O';
    state.board[cellIndex] = marker;

    const winResult = calculateTTTWinner(state.board);
    if (winResult) {
      state.status = 'won';
      state.winner = socket.id;
      state.winningLine = winResult.line;
      activePlayer.score += 1;
    } else if (state.board.every(cell => cell !== null)) {
      state.status = 'draw';
    } else {
      // Switch turn
      const nextPlayer = room.players.find(p => p.id !== socket.id);
      state.currentTurn = nextPlayer.id;
    }

    io.to(roomCode).emit('game_state_updated', {
      gameState: state,
      players: room.players
    });
  });

  socket.on('ttt_reset', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.gameType !== 'ttt') return;
    // Set ready to false, forcing players to ready up again or restart
    room.players.forEach(p => p.ready = false);
    room.gameState = null;
    io.to(roomCode).emit('game_reset', room.players);
  });

  // --- BINGO EVENT HANDLERS ---
  socket.on('bingo_call_number', ({ roomCode, number }) => {
    const room = rooms[roomCode];
    if (!room || room.gameType !== 'bingo' || !room.gameState) return;

    const state = room.gameState;
    if (state.status !== 'playing') return;
    if (state.currentTurn !== socket.id) return;
    if (state.calledNumbers.includes(number)) return;

    state.calledNumbers.push(number);

    // Switch turn
    const nextPlayer = room.players.find(p => p.id !== socket.id);
    state.currentTurn = nextPlayer.id;

    io.to(roomCode).emit('game_state_updated', {
      gameState: state,
      players: room.players
    });
  });

  socket.on('bingo_claim_win', ({ roomCode, board }) => {
    const room = rooms[roomCode];
    if (!room || room.gameType !== 'bingo' || !room.gameState) return;

    const state = room.gameState;
    if (state.status !== 'playing') return;

    // Verify bingo line count
    const isValidWin = verifyBingoWin(board, state.calledNumbers);
    if (isValidWin) {
      state.status = 'won';
      state.winner = socket.id;

      const winningPlayer = room.players.find(p => p.id === socket.id);
      winningPlayer.score += 1;

      io.to(roomCode).emit('game_state_updated', {
        gameState: state,
        players: room.players
      });
    } else {
      // Fake bingo or error check
      socket.emit('error_message', 'You do not have 5 completed lines yet!');
    }
  });

  socket.on('bingo_reset', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.gameType !== 'bingo') return;
    room.players.forEach(p => p.ready = false);
    room.gameState = null;
    io.to(roomCode).emit('game_reset', room.players);
  });

  // --- WORD GUESSING EVENT HANDLERS ---
  socket.on('word_setup', ({ roomCode, word, hint }) => {
    const room = rooms[roomCode];
    if (!room || room.gameType !== 'word' || !room.gameState) return;

    const state = room.gameState;
    if (state.status !== 'waiting_for_word') return;
    if (state.giverId !== socket.id) return;

    state.word = word.trim().toUpperCase();
    state.hint = hint.trim();
    state.guessedLetters = [];
    state.wrongGuesses = 0;
    state.status = 'playing';

    io.to(roomCode).emit('game_state_updated', {
      gameState: state,
      players: room.players
    });
  });

  socket.on('word_guess', ({ roomCode, letter }) => {
    const room = rooms[roomCode];
    if (!room || room.gameType !== 'word' || !room.gameState) return;

    const state = room.gameState;
    if (state.status !== 'playing') return;
    if (state.guesserId !== socket.id) return;

    const normalizedLetter = letter.toUpperCase();
    if (state.guessedLetters.includes(normalizedLetter)) return;

    state.guessedLetters.push(normalizedLetter);

    // Check if letter is in word
    if (!state.word.includes(normalizedLetter)) {
      state.wrongGuesses += 1;
    }

    // Check Win/Lose condition
    const wordUniqueLetters = [...new Set(state.word.replace(/\s/g, ''))];
    const hasWon = wordUniqueLetters.every(char => state.guessedLetters.includes(char));

    if (hasWon) {
      state.status = 'won';
      const guesser = room.players.find(p => p.id === state.guesserId);
      guesser.score += 1;
    } else if (state.wrongGuesses >= 6) {
      state.status = 'lost';
      const giver = room.players.find(p => p.id === state.giverId);
      giver.score += 1;
    }

    io.to(roomCode).emit('game_state_updated', {
      gameState: state,
      players: room.players
    });
  });

  socket.on('word_reset', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.gameType !== 'word' || !room.gameState) return;

    const state = room.gameState;
    // Swap roles for the next round
    const previousGiver = state.giverId;
    const previousGuesser = state.guesserId;

    room.players.forEach(p => p.ready = false);
    room.gameState = {
      giverId: previousGuesser, // guesser becomes giver
      guesserId: previousGiver, // giver becomes guesser
      word: '',
      hint: '',
      guessedLetters: [],
      wrongGuesses: 0,
      status: 'waiting_for_word'
    };

    io.to(roomCode).emit('game_started', {
      gameType: 'word',
      gameState: room.gameState
    });
  });

  // 7. Disconnection Handler
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);

    for (const roomCode in rooms) {
      const room = rooms[roomCode];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);

      if (playerIndex !== -1) {
        const leavingPlayer = room.players[playerIndex];
        room.players.splice(playerIndex, 1);

        if (room.players.length === 0) {
          // Delete room if empty
          delete rooms[roomCode];
          console.log(`Room ${roomCode} deleted (empty)`);
        } else {
          // Notify the remaining player
          io.to(roomCode).emit('player_left', {
            players: room.players,
            message: `${leavingPlayer.name} has disconnected.`
          });

          // Reset game if it was running
          room.gameType = null;
          room.gameState = null;
          room.players.forEach(p => {
            p.ready = false;
            p.role = 'P1'; // Remaining player becomes P1/Host
          });
          io.to(roomCode).emit('players_updated', room.players);
          io.to(roomCode).emit('game_reset', room.players);

          const systemMsg = {
            id: Math.random().toString(),
            sender: 'System',
            text: `${leavingPlayer.name} disconnected. You are now the host.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          room.messages.push(systemMsg);
          io.to(roomCode).emit('chat_message', systemMsg);
        }
        break;
      }
    }
  });
});

// Start listening
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
