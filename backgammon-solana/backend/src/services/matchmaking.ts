interface Player {
    socketId: string;
    publicKey: string;
    stake: number;
    mode: 'quick' | 'ranked';
    elo: number;
    joinedAt: number;
}

interface Match {
    player1: Player;
    player2: Player;
}

export class MatchmakingService {
    private queue: Player[] = [];
    private readonly ELO_THRESHOLD = 200;  // Max ELO difference for matching

    addPlayer(player: Player): void {
        player.joinedAt = Date.now();
        this.queue.push(player);
        console.log(`Player ${player.publicKey} added to queue. Queue size: ${this.queue.length}`);
    }

    removePlayer(socketId: string): void {
        const index = this.queue.findIndex(p => p.socketId === socketId);
        if (index !== -1) {
            this.queue.splice(index, 1);
            console.log(`Player removed from queue. Queue size: ${this.queue.length}`);
        }
    }

    getQueuePosition(socketId: string): number {
        return this.queue.findIndex(p => p.socketId === socketId) + 1;
    }

    findMatch(socketId: string): Match | null {
        const playerIndex = this.queue.findIndex(p => p.socketId === socketId);
        if (playerIndex === -1) return null;

        const player = this.queue[playerIndex];

        // Find opponents with similar stake and ELO (for ranked mode)
        for (let i = 0; i < this.queue.length; i++) {
            if (i === playerIndex) continue;

            const opponent = this.queue[i];

            // Match criteria
            const stakeMatch = Math.abs(player.stake - opponent.stake) < player.stake * 0.1; // Within 10%
            const eloMatch = player.mode === 'ranked'
                ? Math.abs(player.elo - opponent.elo) <= this.ELO_THRESHOLD
                : true;  // Quick mode ignores ELO

            if (stakeMatch && eloMatch) {
                // Remove both players from queue
                this.queue.splice(Math.max(playerIndex, i), 1);
                this.queue.splice(Math.min(playerIndex, i), 1);

                console.log(`Match found: ${player.publicKey} vs ${opponent.publicKey}`);

                return {
                    player1: player,
                    player2: opponent
                };
            }
        }

        // No match found
        // After 30 seconds in queue, relax ELO requirement
        const waitTime = Date.now() - player.joinedAt;
        if (player.mode === 'ranked' && waitTime > 30000) {
            console.log(`Relaxing ELO requirement for ${player.publicKey} after ${waitTime}ms wait`);
            // Retry with any opponent matching stake
            for (let i = 0; i < this.queue.length; i++) {
                if (i === playerIndex) continue;
                const opponent = this.queue[i];

                if (Math.abs(player.stake - opponent.stake) < player.stake * 0.1) {
                    this.queue.splice(Math.max(playerIndex, i), 1);
                    this.queue.splice(Math.min(playerIndex, i), 1);

                    return {
                        player1: player,
                        player2: opponent
                    };
                }
            }
        }

        return null;
    }

    getQueueStats() {
        return {
            total: this.queue.length,
            quick: this.queue.filter(p => p.mode === 'quick').length,
            ranked: this.queue.filter(p => p.mode === 'ranked').length,
            avgElo: this.queue.reduce((sum, p) => sum + p.elo, 0) / (this.queue.length || 1)
        };
    }
}
