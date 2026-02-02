import { randomBytes } from 'crypto';

interface GameRoom {
    id: string;
    player1: { socketId: string; publicKey: string };
    player2: { socketId: string; publicKey: string };
    boardState: number[];
    currentTurn: string;
    createdAt: number;
    lastActivity: number;
}

export class GameRoomManager {
    private rooms: Map<string, GameRoom> = new Map();
    private playerRooms: Map<string, string> = new Map();  // socketId -> roomId

    createRoom(player1: any, player2: any): string {
        const roomId = this.generateRoomId();

        const room: GameRoom = {
            id: roomId,
            player1: {
                socketId: player1.socketId,
                publicKey: player1.publicKey
            },
            player2: {
                socketId: player2.socketId,
                publicKey: player2.publicKey
            },
            boardState: this.initializeBoard(),
            currentTurn: player1.publicKey,
            createdAt: Date.now(),
            lastActivity: Date.now()
        };

        this.rooms.set(roomId, room);
        this.playerRooms.set(player1.socketId, roomId);
        this.playerRooms.set(player2.socketId, roomId);

        console.log(`Game room created: ${roomId}`);
        return roomId;
    }

    getRoom(roomId: string): GameRoom | undefined {
        return this.rooms.get(roomId);
    }

    updateRoomState(roomId: string, boardState: number[]): void {
        const room = this.rooms.get(roomId);
        if (room) {
            room.boardState = boardState;
            room.lastActivity = Date.now();

            // Switch turn
            room.currentTurn = room.currentTurn === room.player1.publicKey
                ? room.player2.publicKey
                : room.player1.publicKey;
        }
    }

    closeRoom(roomId: string): void {
        const room = this.rooms.get(roomId);
        if (room) {
            this.playerRooms.delete(room.player1.socketId);
            this.playerRooms.delete(room.player2.socketId);
            this.rooms.delete(roomId);
            console.log(`Game room closed: ${roomId}`);
        }
    }

    handlePlayerDisconnect(socketId: string): void {
        const roomId = this.playerRooms.get(socketId);
        if (roomId) {
            // Mark player as disconnected, give them 60 seconds to reconnect
            console.log(`Player ${socketId} disconnected from room ${roomId}`);

            // For now, just close the room
            // TODO: Implement reconnection logic
            this.closeRoom(roomId);
        }
    }

    getActiveGamesCount(): number {
        return this.rooms.size;
    }

    private generateRoomId(): string {
        return `room_${randomBytes(8).toString('hex')}`;
    }

    private initializeBoard(): number[] {
        const board = new Array(28).fill(0);

        // Standard backgammon starting position
        board[0] = 2;
        board[11] = 5;
        board[16] = 3;
        board[18] = 5;
        board[23] = -2;
        board[12] = -5;
        board[7] = -3;
        board[5] = -5;

        return board;
    }

    // Clean up inactive rooms (called periodically)
    cleanupInactiveRooms(timeout: number = 600000): void {  // 10 minutes default
        const now = Date.now();
        for (const [roomId, room] of this.rooms.entries()) {
            if (now - room.lastActivity > timeout) {
                console.log(`Cleaning up inactive room: ${roomId}`);
                this.closeRoom(roomId);
            }
        }
    }
}
