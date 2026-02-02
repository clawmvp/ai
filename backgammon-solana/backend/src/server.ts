import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { MatchmakingService } from './services/matchmaking';
import { GameRoomManager } from './services/gameRoomManager';
import { AntiCheatService } from './services/antiCheat';
import { AIOpponent, DifficultyLevel } from './services/aiOpponent';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Services
const matchmaking = new MatchmakingService();
const gameRoomManager = new GameRoomManager();
const antiCheat = new AntiCheatService();

// Welcome page
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head><title>Solana Tabla Pro - Backend</title></head>
            <body style="font-family: Arial; padding: 50px; background: #1a1a2e; color: #fff;">
                <h1>🎲 Solana Tabla Pro - Multiplayer Backend</h1>
                <p>WebSocket server running on port ${PORT}</p>
                <h2>Status: <span style="color: #00ff88;">ONLINE</span></h2>
                <ul>
                    <li>Socket.io WebSocket server ✅</li>
                    <li>ELO matchmaking service ✅</li>
                    <li>Game room manager ✅</li>
                    <li>Anti-cheat validation ✅</li>
                    <li>AI opponent (3 difficulty levels) ✅</li>
                </ul>
                <h3>Endpoints:</h3>
                <ul>
                    <li><a href="/health" style="color: #00d4ff;">GET /health</a> - Server health check</li>
                </ul>
                <p>Connect via Socket.io at: <code>ws://localhost:${PORT}</code></p>
            </body>
        </html>
    `);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        players: io.sockets.sockets.size,
        activeGames: gameRoomManager.getActiveGamesCount()
    });
});

// WebSocket connection handling
io.on('connection', (socket: Socket) => {
    console.log(`Player connected: ${socket.id}`);

    const publicKey = socket.handshake.query.publicKey as string;

    if (!publicKey) {
        socket.emit('error', { message: 'Public key required' });
        socket.disconnect();
        return;
    }

    // Join matchmaking queue
    socket.on('join_queue', (data: { stake: number, mode: 'quick' | 'ranked' }) => {
        console.log(`${publicKey} joined queue`);

        matchmaking.addPlayer({
            socketId: socket.id,
            publicKey,
            stake: data.stake,
            mode: data.mode,
            elo: 1200, // TODO: Fetch from on-chain data
            joinedAt: Date.now(),
        });

        socket.emit('queue_joined', { position: matchmaking.getQueuePosition(socket.id) });

        // Try to match immediately
        const match = matchmaking.findMatch(socket.id);
        if (match) {
            const roomId = gameRoomManager.createRoom(match.player1, match.player2);

            io.to(match.player1.socketId).emit('match_found', {
                roomId,
                opponent: match.player2.publicKey,
                stake: match.player1.stake
            });

            io.to(match.player2.socketId).emit('match_found', {
                roomId,
                opponent: match.player1.publicKey,
                stake: match.player2.stake
            });
        }
    });

    // Leave matchmaking queue
    socket.on('leave_queue', () => {
        matchmaking.removePlayer(socket.id);
        socket.emit('queue_left');
    });

    // Join game room
    socket.on('join_room', (data: { roomId: string }) => {
        socket.join(data.roomId);
        socket.emit('room_joined', { roomId: data.roomId });

        // Notify opponent
        socket.to(data.roomId).emit('opponent_connected');
    });

    // Dice roll
    socket.on('roll_dice', (data: { roomId: string, dice1: number, dice2: number }) => {
        // Validate dice values
        if (!antiCheat.validateDiceRoll(data.dice1, data.dice2)) {
            socket.emit('error', { message: 'Invalid dice roll' });
            return;
        }

        // Broadcast to room
        socket.to(data.roomId).emit('dice_rolled', {
            dice1: data.dice1,
            dice2: data.dice2,
            player: publicKey
        });
    });

    // Make move
    socket.on('make_move', (data: { roomId: string, from: number, to: number, boardState: number[] }) => {
        const room = gameRoomManager.getRoom(data.roomId);

        if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }

        // Validate move
        const isValidMove = antiCheat.validateMove(data.from, data.to, data.boardState);

        if (!isValidMove) {
            socket.emit('error', { message: 'Invalid move detected' });
            // TODO: Increment cheating counter, potentially ban
            return;
        }

        // Broadcast move to opponent
        socket.to(data.roomId).emit('opponent_move', {
            from: data.from,
            to: data.to,
            player: publicKey
        });

        // Update room state
        gameRoomManager.updateRoomState(data.roomId, data.boardState);
    });

    // Game end
    socket.on('game_end', (data: { roomId: string, winner: string }) => {
        socket.to(data.roomId).emit('game_ended', {
            winner: data.winner
        });

        // Clean up room
        gameRoomManager.closeRoom(data.roomId);
    });

    // Single Player AI - Start game
    socket.on('start_ai_game', (data: { difficulty: DifficultyLevel }) => {
        const aiRoomId = `ai_${socket.id}_${Date.now()}`;
        console.log(`Starting AI game: ${aiRoomId} with difficulty: ${data.difficulty}`);

        socket.emit('ai_game_started', {
            roomId: aiRoomId,
            difficulty: data.difficulty
        });
    });

    // Single Player AI - Request AI move
    socket.on('request_ai_move', (data: { roomId: string, boardState: number[], dice: [number, number], difficulty: DifficultyLevel }) => {
        const ai = new AIOpponent(data.difficulty);

        // AI calculates its move
        const aiMove = ai.chooseMove(data.boardState, data.dice);

        if (aiMove) {
            // Send AI's move back to client
            setTimeout(() => {
                socket.emit('ai_move', {
                    from: aiMove.from,
                    to: aiMove.to,
                    difficulty: data.difficulty
                });
            }, 500 + Math.random() * 1000); // Delay for realism (0.5-1.5s)
        } else {
            // AI has no valid moves
            socket.emit('ai_no_moves', {
                message: 'AI has no valid moves'
            });
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        matchmaking.removePlayer(socket.id);
        gameRoomManager.handlePlayerDisconnect(socket.id);
    });
});

httpServer.listen(PORT, () => {
    console.log(`🎲 Solana Tabla Pro backend running on port ${PORT}`);
    console.log(`WebSocket server ready for connections`);
});
