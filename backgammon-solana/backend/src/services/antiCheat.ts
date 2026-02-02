export class AntiCheatService {
    private suspiciousPlayers: Map<string, number> = new Map();  // publicKey -> violation count

    validateDiceRoll(dice1: number, dice2: number): boolean {
        // Dice must be between 1-6
        if (dice1 < 1 || dice1 > 6 || dice2 < 1 || dice2 > 6) {
            return false;
        }

        // On client, dice should use VRF from blockchain
        // Here we just validate range
        return true;
    }

    validateMove(from: number, to: number, boardState: number[]): boolean {
        // Basic validation
        if (from < 0 || from >= 28 || to < 0 || to >= 28) {
            return false;
        }

        if (from === to) {
            return false;
        }

        // Check if there's a checker at the 'from' position
        if (boardState[from] === 0) {
            return false;
        }

        // Additional game rules validation would go here
        // For MVP, basic validation is sufficient

        return true;
    }

    validateBoardState(boardState: number[]): boolean {
        if (boardState.length !== 28) {
            return false;
        }

        // Count total checkers
        let player1Checkers = 0;
        let player2Checkers = 0;

        for (const count of boardState) {
            if (count > 0) {
                player1Checkers += count;
            } else if (count < 0) {
                player2Checkers += Math.abs(count);
            }
        }

        // Each player should have <= 15 checkers
        if (player1Checkers > 15 || player2Checkers > 15) {
            return false;
        }

        return true;
    }

    reportSuspiciousActivity(publicKey: string): void {
        const count = (this.suspiciousPlayers.get(publicKey) || 0) + 1;
        this.suspiciousPlayers.set(publicKey, count);

        if (count >= 3) {
            console.warn(`⚠️ Player ${publicKey} has ${count} violations - consider banning`);
            // TODO: Implement banning logic (store in database, check on connection)
        }
    }

    isBanned(publicKey: string): boolean {
        // TODO: Check against banned players database
        return false;
    }

    // Rate limiting for actions
    private actionTimestamps: Map<string, number[]> = new Map();

    checkRateLimit(publicKey: string, action: string, maxPerMinute: number = 60): boolean {
        const key = `${publicKey}:${action}`;
        const now = Date.now();
        const timestamps = this.actionTimestamps.get(key) || [];

        // Remove timestamps older than 1 minute
        const recentTimestamps = timestamps.filter(ts => now - ts < 60000);

        if (recentTimestamps.length >= maxPerMinute) {
            console.warn(`Rate limit exceeded for ${publicKey} on action ${action}`);
            return false;
        }

        recentTimestamps.push(now);
        this.actionTimestamps.set(key, recentTimestamps);

        return true;
    }
}
