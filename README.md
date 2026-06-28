# Multiplayer Games Hub 🎮

A premium, real-time multiplayer gaming hub featuring classic games you can play with friends using custom room codes. 

Powered by **React** on the frontend and **Node.js/Express + Socket.io** on the backend.

---

## 🌟 Features

- 🔑 **Lobby Rooms**: Create or join rooms using unique 6-character room codes.
- 💬 **Live Chat**: Real-time room messaging built into the lobby.
- 👥 **Interactive Player Cards**: Toggle ready statuses, check active roles, and see scores in real-time.
- 🎲 **Classic Games Included**:
  - ❌ **Tic-Tac-Toe**: Interactive grid play with automatic win line animations and score tracking.
  - 🔢 **Bingo**: Real-time number caller system with automatic 5-line completion win verification.
  - 🔤 **Word Guessing**: Role-based (Giver vs. Guesser) letter guessing game with round/role swapping.

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (v19)
- **Vite** (for blazing fast build & HMR)
- **Socket.io-client** (for real-time communication)
- **Lucide React** (icons)
- **Vanilla CSS** (sleek dark glassmorphism design with vibrant animated gradients)

### Backend
- **Node.js** & **Express**
- **Socket.io** (real-time server logic & room state orchestration)
- **Cors**

---

## 📂 Project Structure

```text
online-games/
├── frontend/             # React application (Vite template)
│   ├── src/
│   │   ├── components/   # Game components (Bingo, TicTacToe, WordGuessing, Lobby, Home)
│   │   ├── App.jsx       # App entrypoint and socket listeners
│   │   └── index.css     # Styling design system
│   └── package.json
│
├── backend/              # Node.js Express server
│   ├── server.js         # Core room states and socket event handlers
│   └── package.json
│
├── package.json          # Root scripts to run concurrently
└── .gitignore            # Root gitignore ignoring node_modules, dist, etc.
```

---

## 🚀 Getting Started

Follow these steps to run the project locally on your machine:

### 1. Install Dependencies
Run the command at the root directory to install dependencies for the root, frontend, and backend projects:
```bash
npm run install-all
```

### 2. Run the Development Server
Start both the backend server and frontend development server concurrently:
```bash
npm run dev
```

- **Frontend** will be running at: `http://localhost:5173`
- **Backend (Sockets)** will be listening on port: `5000`

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
