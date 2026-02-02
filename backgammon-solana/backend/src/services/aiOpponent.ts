// AI opponent for single player mode
// Implements backgammon AI with 3 difficulty levels

export type DifficultyLevel = 'beginner' | 'medium' | 'hard';

interface Move {
    from: number;
    to: number;
}

interface GameState {
    board: number[];
    dice: [number, number];
    currentPlayer: number; // 1 or -1
}

export class AIOpponent {
    private difficulty: DifficultyLevel;

    constructor(difficulty: DifficultyLevel = 'medium') {
        this.difficulty = difficulty;
    }

    // Main AI decision function
    public chooseMove(board: number[], dice: [number, number]): Move | null {
        const possibleMoves = this.generatePossibleMoves(board, dice);

        if (possibleMoves.length === 0) {
            return null;
        }

        switch (this.difficulty) {
            case 'beginner':
                return this.chooseMoveRandom(possibleMoves);
            case 'medium':
                return this.chooseMoveGreedy(board, possibleMoves);
            case 'hard':
                return this.chooseMoveStrategic(board, possibleMoves, dice);
            default:
                return this.chooseMoveRandom(possibleMoves);
        }
    }

    // Beginner: Random valid move
    private chooseMoveRandom(moves: Move[]): Move {
        return moves[Math.floor(Math.random() * moves.length)];
    }

    // Medium: Greedy - prioritize bearing off, then moving forward
    private chooseMoveGreedy(board: number[], moves: Move[]): Move {
        // Score each move
        const scoredMoves = moves.map(move => ({
            move,
            score: this.scoreMove(board, move)
        }));

        // Sort by score (descending)
        scoredMoves.sort((a, b) => b.score - a.score);

        // Add some randomness (pick from top 3)
        const topMoves = scoredMoves.slice(0, Math.min(3, scoredMoves.length));
        return topMoves[Math.floor(Math.random() * topMoves.length)].move;
    }

    // Hard: Strategic - considers blocking, hitting, and bearing off
    private chooseMoveStrategic(board: number[], moves: Move[], dice: [number, number]): Move {
        const scoredMoves = moves.map(move => ({
            move,
            score: this.scoreStrategicMove(board, move, dice)
        }));

        scoredMoves.sort((a, b) => b.score - a.score);

        // Best move with minimal randomness
        const topMoves = scoredMoves.slice(0, 2);
        return topMoves[Math.floor(Math.random() * topMoves.length)].move;
    }

    // Generate all possible moves for AI (player -1)
    private generatePossibleMoves(board: number[], dice: [number, number]): Move[] {
        const moves: Move[] = [];

        // Try each position
        for (let from = 0; from < 24; from++) {
            if (board[from] < 0) { // AI pieces are negative
                // Try first die
                const to1 = from + dice[0];
                if (this.isValidMove(board, from, to1, -1)) {
                    moves.push({ from, to: to1 });
                }

                // Try second die
                const to2 = from + dice[1];
                if (this.isValidMove(board, from, to2, -1)) {
                    moves.push({ from, to: to2 });
                }

                // For doubles, allow multiple moves
                if (dice[0] === dice[1]) {
                    const to3 = from + dice[0] * 2;
                    if (this.isValidMove(board, from, to3, -1)) {
                        moves.push({ from, to: to3 });
                    }

                    const to4 = from + dice[0] * 3;
                    if (this.isValidMove(board, from, to4, -1)) {
                        moves.push({ from, to: to4 });
                    }
                }
            }
        }

        // Check bearing off (positions 24-27)
        if (this.canBearOff(board, -1)) {
            for (let from = 18; from < 24; from++) {
                if (board[from] < 0) {
                    moves.push({ from, to: 26 }); // Bear off position
                }
            }
        }

        return moves;
    }

    // Check if move is valid
    private isValidMove(board: number[], from: number, to: number, player: number): boolean {
        // Out of bounds
        if (to < 0 || to >= 28) return false;

        // No checker at from position
        if (player === 1 && board[from] <= 0) return false;
        if (player === -1 && board[from] >= 0) return false;

        // Target position blocked by opponent
        if (player === 1 && board[to] < -1) return false;
        if (player === -1 && board[to] > 1) return false;

        return true;
    }

    // Check if player can bear off
    private canBearOff(board: number[], player: number): boolean {
        const homeStart = player === 1 ? 0 : 18;
        const homeEnd = player === 1 ? 6 : 24;

        // All pieces must be in home board
        for (let i = 0; i < 28; i++) {
            if (i >= homeStart && i < homeEnd) continue;

            if (player === 1 && board[i] > 0) return false;
            if (player === -1 && board[i] < 0) return false;
        }

        return true;
    }

    // Score a move (greedy strategy)
    private scoreMove(board: number[], move: Move): number {
        let score = 0;

        // Bearing off is highest priority
        if (move.to >= 24) {
            score += 100;
        }

        // Moving forward is good
        score += move.to - move.from;

        // Hitting opponent
        if (board[move.to] > 0 && board[move.to] === 1) {
            score += 50;
        }

        return score;
    }

    // Score a move (strategic)
    private scoreStrategicMove(board: number[], move: Move, dice: [number, number]): number {
        let score = this.scoreMove(board, move);

        // Additional strategic considerations

        // Creating blocks (two or more checkers on a point)
        const newBoard = [...board];
        newBoard[move.from]++;
        newBoard[move.to]--;

        if (newBoard[move.to] <= -2) {
            score += 30; // Creating a block
        }

        // Avoiding blots (single checkers vulnerable to hitting)
        if (board[move.to] === -1) {
            score -= 20; // Leaving a blot is risky
        }

        // Prime building (consecutive blocked points)
        let primeLength = 0;
        for (let i = move.to; i < 24 && newBoard[i] <= -2; i++) {
            primeLength++;
        }
        score += primeLength * 10;

        return score;
    }

    // Change difficulty
    public setDifficulty(level: DifficultyLevel): void {
        this.difficulty = level;
    }

    // Get current difficulty
    public getDifficulty(): DifficultyLevel {
        return this.difficulty;
    }
}
