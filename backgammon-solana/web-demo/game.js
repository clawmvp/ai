// Backgammon Pro - Web Demo
// Single Player & Multiplayer Backgammon

// WebSocket for multiplayer
const WS_URL = 'wss://your-backend.vercel.app'; // Update with real backend URL
let socket = null;
let isMultiplayer = false;
let roomCode = null;
let isHost = false;
let opponentConnected = false;

// Solana Configuration
const SOLANA_RPC = 'https://api.devnet.solana.com';
const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd';

// Solana Wallet State
let walletConnected = false;
let walletPublicKey = null;
let walletProvider = null;
let solBalance = 0;
let solPrice = 0;
let balanceInterval = null;

// Game State
let board = [];
let dice = [0, 0];
let usedDice = [false, false];
let currentPlayer = 1; // 1 = white (player), -1 = black (AI/opponent)
let selectedPoint = null;
let difficulty = 'medium';
let gameOver = false;
let stats = { games: 0, wins: 0 };

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    checkSavedWallet(); // Check for previously connected wallet
    fetchSolPrice(); // Get current SOL price
    setTimeout(() => {
        document.getElementById('loading-screen').classList.remove('active');
        document.getElementById('menu-screen').classList.add('active');
        showWalletHeader(); // Show wallet header
    }, 2500);
});

// Navigation
function showDifficultySelect() {
    document.getElementById('menu-screen').classList.remove('active');
    document.getElementById('difficulty-screen').classList.add('active');
}

function showMenu() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('menu-screen').classList.add('active');
}

function exitGame() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('result-modal').classList.add('hidden');
    document.getElementById('menu-screen').classList.add('active');
}

// Start Game
function startGame(diff) {
    difficulty = diff;
    initBoard();

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('game-screen').classList.add('active');

    const diffNames = { beginner: 'Începător', medium: 'Mediu', hard: 'Expert' };
    document.getElementById('difficulty-display').textContent = `vs AI ${diffNames[diff]}`;

    renderBoard();
    updateTurnDisplay();
    enableRoll();
}

function playAgain() {
    document.getElementById('result-modal').classList.add('hidden');
    startGame(difficulty);
}

// Initialize Board - Standard backgammon setup
function initBoard() {
    board = new Array(24).fill(0);

    // White checkers (Player 1) - Moves 24 -> 1 (Index 23 -> 0) home 0-5
    board[23] = 2;  // 24-point
    board[12] = 5;  // 13-point
    board[7] = 3;   // 8-point
    board[5] = 5;   // 6-point

    // Black checkers (AI/Player -1) - Moves 1 -> 24 (Index 0 -> 23) home 18-23
    board[0] = -2;  // 1-point
    board[11] = -5; // 12-point
    board[16] = -3; // 17-point
    board[18] = -5; // 19-point

    dice = [0, 0];
    usedDice = [false, false];
    currentPlayer = 1;
    selectedPoint = null;
    gameOver = false;
}

// Render Board
function renderBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';

    // Top row (points 12-23, right to left visually but we render left to right)
    // Points 12-17 on left, bar, points 18-23 on right
    // Top row (points 12-23, Left to Right)
    // Visual: 13 14 15 16 17 18 |BAR| 19 20 21 22 23 24 (Indices 12-23)
    // Bottom row (points 11-0, Left to Right)
    // Visual: 12 11 10 9 8 7 |BAR| 6 5 4 3 2 1 (Indices 11-0)

    for (let row = 0; row < 2; row++) {
        const isTop = row === 0;
        // Indices to render in order
        const indices = isTop ?
            Array.from({ length: 12 }, (_, k) => 12 + k) : // 12, 13,... 23
            Array.from({ length: 12 }, (_, k) => 11 - k);  // 11, 10,... 0

        for (let i of indices) {
            // Add bar spacer logic
            // Top: after index 17 (6th point). Bottom: after index 6 (6th point in reverse: 11,10,9,8,7,6... spacer... 5,4,3,2,1,0)
            const showSpacer = (isTop && i === 18) || (!isTop && i === 5);

            if (showSpacer) {
                const barSpacer = document.createElement('div');
                barSpacer.className = 'bar-spacer';
                boardEl.appendChild(barSpacer);
            }

            const point = document.createElement('div');
            point.className = `point ${isTop ? 'top' : 'bottom'} ${i % 2 === 0 ? 'even' : 'odd'}`;
            point.dataset.index = i;
            point.onclick = () => handlePointClick(i);

            // Render checkers
            const count = board[i];
            const absCount = Math.abs(count);
            const isWhite = count > 0;

            for (let j = 0; j < Math.min(absCount, 5); j++) {
                const checker = document.createElement('div');
                checker.className = `checker ${isWhite ? 'white' : 'black'}`;
                if (absCount > 5 && j === 4) {
                    checker.classList.add('stacked');
                    checker.setAttribute('data-count', absCount);
                }
                point.appendChild(checker);
            }

            boardEl.appendChild(point);
        }
    }

    updateValidMoves();
}

// Handle Point Click
function handlePointClick(index) {
    if (gameOver || currentPlayer !== 1) return;
    if (dice[0] === 0 && dice[1] === 0) return;

    const count = board[index];

    // Select a checker
    if (selectedPoint === null) {
        if (count > 0) { // Player's checker
            selectedPoint = index;
            document.querySelectorAll('.point')[index].classList.add('selected');
            updateValidMoves();
        }
    } else {
        // Move to this point
        if (isValidMove(selectedPoint, index)) {
            makeMove(selectedPoint, index);
            clearSelection();
            renderBoard();

            if (checkWinner()) return;

            // Check if turn ends
            if (usedDice[0] && usedDice[1]) {
                endTurn();
            } else {
                // Check if player has any valid moves left
                if (!hasValidMoves(1)) {
                    showMessage('Nu mai ai mișcări valide!');
                    setTimeout(endTurn, 1200);
                } else {
                    updateValidMoves();
                }
            }
        } else if (count > 0) {
            // Select different checker
            clearSelection();
            selectedPoint = index;
            document.querySelectorAll('.point')[index].classList.add('selected');
            updateValidMoves();
        } else {
            clearSelection();
        }
    }
}

function clearSelection() {
    selectedPoint = null;
    document.querySelectorAll('.point').forEach(p => {
        p.classList.remove('selected');
        p.classList.remove('valid-move');
    });
}

// Move Validation
function isValidMove(from, to) {
    if (to < 0 || to > 23) return false;

    const direction = currentPlayer === 1 ? -1 : 1; // White moves to 0, Black to 23
    const distance = (to - from) * direction;

    // Check if using a valid die
    let validDie = false;
    if (!usedDice[0] && dice[0] === distance) validDie = true;
    if (!usedDice[1] && dice[1] === distance) validDie = true;

    if (!validDie) return false;

    // Check destination
    const destCount = board[to];
    if (currentPlayer === 1 && destCount < -1) return false; // Blocked
    if (currentPlayer === -1 && destCount > 1) return false;

    return true;
}

// Update Valid Move Highlights
function updateValidMoves() {
    document.querySelectorAll('.point').forEach(p => p.classList.remove('valid-move'));

    if (selectedPoint === null) return;

    for (let to = 0; to < 24; to++) {
        if (isValidMove(selectedPoint, to)) {
            document.querySelectorAll('.point')[to].classList.add('valid-move');
        }
    }
}

// Make Move
function makeMove(from, to) {
    const count = board[from];
    const direction = currentPlayer === 1 ? -1 : 1;
    const distance = (to - from) * direction;

    // Use the die
    if (!usedDice[0] && dice[0] === distance) {
        usedDice[0] = true;
        document.getElementById('die1').classList.add('used');
    } else if (!usedDice[1] && dice[1] === distance) {
        usedDice[1] = true;
        document.getElementById('die2').classList.add('used');
    }

    // Hit opponent
    if ((currentPlayer === 1 && board[to] === -1) ||
        (currentPlayer === -1 && board[to] === 1)) {
        // Send to bar (simplified - just flip)
        board[to] = 0;
        showMessage('Ai lovit o piesă!');
    }

    // Move checker
    board[from] -= currentPlayer;
    board[to] += currentPlayer;

    updateMovesLeft();
}

function updateMovesLeft() {
    const remaining = (usedDice[0] ? 0 : 1) + (usedDice[1] ? 0 : 1);
    document.getElementById('moves-left').textContent = `Mișcări rămase: ${remaining}`;
}

// Roll Dice
function rollDice() {
    if (currentPlayer !== 1 || (dice[0] !== 0 && !usedDice[0])) return;

    dice = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
    ];
    usedDice = [false, false];

    // Animate dice
    const die1 = document.getElementById('die1');
    const die2 = document.getElementById('die2');

    die1.classList.remove('used');
    die2.classList.remove('used');

    // Rolling animation
    let rolls = 0;
    const rollInterval = setInterval(() => {
        die1.textContent = Math.floor(Math.random() * 6) + 1;
        die2.textContent = Math.floor(Math.random() * 6) + 1;
        rolls++;
        if (rolls > 10) {
            clearInterval(rollInterval);
            die1.textContent = dice[0];
            die2.textContent = dice[1];

            document.getElementById('roll-btn').disabled = true;
            updateMovesLeft();

            // Check if player has valid moves
            if (!hasValidMoves(1)) {
                showMessage('Nu ai mișcări valide!');
                setTimeout(endTurn, 1500);
            }
        }
    }, 80);
}

function enableRoll() {
    dice = [0, 0];
    usedDice = [false, false];
    document.getElementById('die1').textContent = '?';
    document.getElementById('die2').textContent = '?';
    document.getElementById('die1').classList.remove('used');
    document.getElementById('die2').classList.remove('used');
    document.getElementById('roll-btn').disabled = false;
    document.getElementById('moves-left').textContent = '';
}

// Check for valid moves
function hasValidMoves(player) {
    for (let from = 0; from < 24; from++) {
        if ((player === 1 && board[from] > 0) || (player === -1 && board[from] < 0)) {
            for (let to = 0; to < 24; to++) {
                if (isValidMoveFor(from, to, player)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function isValidMoveFor(from, to, player) {
    if (to < 0 || to > 23) return false;

    const direction = player === 1 ? -1 : 1;
    const distance = (to - from) * direction;

    let validDie = false;
    if (!usedDice[0] && dice[0] === distance) validDie = true;
    if (!usedDice[1] && dice[1] === distance) validDie = true;

    if (!validDie) return false;

    const destCount = board[to];
    if (player === 1 && destCount < -1) return false;
    if (player === -1 && destCount > 1) return false;

    return true;
}

// End Turn
function endTurn() {
    currentPlayer = currentPlayer === 1 ? -1 : 1;
    updateTurnDisplay();

    if (currentPlayer === -1) {
        // AI turn
        aiTurn();
    } else {
        enableRoll();
    }
}

function updateTurnDisplay() {
    const display = document.getElementById('turn-display');
    if (currentPlayer === 1) {
        display.textContent = 'Tura ta';
        display.style.background = '#00ff88';
    } else {
        display.textContent = 'AI gândește...';
        display.style.background = '#ff8800';
    }
}

// AI Logic
function aiTurn() {
    // Roll dice for AI
    dice = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
    ];
    usedDice = [false, false];

    document.getElementById('die1').textContent = dice[0];
    document.getElementById('die2').textContent = dice[1];
    document.getElementById('die1').classList.remove('used');
    document.getElementById('die2').classList.remove('used');

    setTimeout(() => aiMakeMove(), 800);
}

function aiMakeMove() {
    if (gameOver) return;

    const move = chooseAIMove();

    if (move) {
        // Highlight AI move
        const points = document.querySelectorAll('.point');
        points[move.from].style.boxShadow = '0 0 20px #ff8800';

        setTimeout(() => {
            points[move.from].style.boxShadow = '';

            // Make the move
            currentPlayer = -1;

            // Use the die
            const distance = (move.to - move.from) * 1; // AI is -1, moves Ascending -> distance positive
            if (!usedDice[0] && dice[0] === distance) {
                usedDice[0] = true;
                document.getElementById('die1').classList.add('used');
            } else if (!usedDice[1] && dice[1] === distance) {
                usedDice[1] = true;
                document.getElementById('die2').classList.add('used');
            }

            // Hit player
            if (board[move.to] === 1) {
                board[move.to] = 0;
                showMessage('AI a lovit o piesă!');
            }

            board[move.from] -= -1;
            board[move.to] += -1;

            renderBoard();

            if (checkWinner()) return;

            // Check for more moves
            if (!usedDice[0] || !usedDice[1]) {
                if (hasValidMoves(-1)) {
                    setTimeout(() => aiMakeMove(), 600);
                } else {
                    endTurn();
                }
            } else {
                endTurn();
            }
        }, 500);
    } else {
        // No valid moves
        showMessage('AI nu are mișcări');
        setTimeout(endTurn, 1000);
    }
}

function chooseAIMove() {
    const moves = [];

    // Generate all possible moves
    for (let from = 0; from < 24; from++) {
        if (board[from] < 0) { // AI pieces
            for (let to = 0; to < 24; to++) {
                if (isValidMoveFor(from, to, -1)) {
                    moves.push({ from, to, score: scoreMove(from, to) });
                }
            }
        }
    }

    if (moves.length === 0) return null;

    // Sort by score (difficulty determines randomness)
    moves.sort((a, b) => b.score - a.score);

    switch (difficulty) {
        case 'beginner':
            // Random move
            return moves[Math.floor(Math.random() * moves.length)];
        case 'medium':
            // Top 3 random
            return moves[Math.floor(Math.random() * Math.min(3, moves.length))];
        case 'hard':
            // Best move with slight randomness
            return moves[Math.floor(Math.random() * Math.min(2, moves.length))];
        default:
            return moves[0];
    }
}

function scoreMove(from, to) {
    let score = 0;

    // Forward progress (AI moves 0->23)
    score += (to - from);

    // Hitting opponent
    if (board[to] === 1) score += 50;

    // Building blocks
    if (board[to] === -1) score += 30;

    // Avoid leaving blots
    if (board[from] === -1) score -= 20;

    return score;
}

// Check Winner
function checkWinner() {
    // Count pieces
    let whitePieces = 0;
    let blackPieces = 0;

    for (let i = 0; i < 24; i++) {
        if (board[i] > 0) whitePieces += board[i];
        if (board[i] < 0) blackPieces += Math.abs(board[i]);
    }

    if (whitePieces === 0) {
        gameOver = true;
        showResult(true);
        return true;
    }

    if (blackPieces === 0) {
        gameOver = true;
        showResult(false);
        return true;
    }

    return false;
}

function showResult(playerWon) {
    stats.games++;
    if (playerWon) stats.wins++;
    saveStats();
    updateStatsDisplay();

    const modal = document.getElementById('result-modal');
    const icon = document.getElementById('result-icon');
    const title = document.getElementById('result-title');
    const text = document.getElementById('result-text');

    if (playerWon) {
        icon.textContent = '🏆';
        title.textContent = 'Ai câștigat!';
        text.textContent = 'Felicitări! Ai învins AI-ul!';
    } else {
        icon.textContent = '😔';
        title.textContent = 'Ai pierdut';
        text.textContent = 'AI-ul a câștigat. Mai încearcă!';
    }

    modal.classList.remove('hidden');
}

// Messages
function showMessage(msg) {
    const el = document.getElementById('game-message');
    el.textContent = msg;
    el.classList.remove('hidden');

    setTimeout(() => {
        el.classList.add('hidden');
    }, 2000);
}

// Stats
function loadStats() {
    const saved = localStorage.getItem('tabla-stats');
    if (saved) {
        stats = JSON.parse(saved);
    }
    updateStatsDisplay();
}

function saveStats() {
    localStorage.setItem('tabla-stats', JSON.stringify(stats));
}

function updateStatsDisplay() {
    document.getElementById('games-played').textContent = stats.games;
    document.getElementById('wins').textContent = stats.wins;
    document.getElementById('win-rate').textContent =
        stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) + '%' : '0%';
}

// ==========================================
// SOLANA WALLET FUNCTIONS
// ==========================================

async function connectWallet() {
    // Check for Phantom
    const provider = window.phantom?.solana || window.solana;

    if (!provider) {
        // No wallet found - offer to install
        showMessage('Instalează Phantom wallet!');
        setTimeout(() => {
            window.open('https://phantom.app/', '_blank');
        }, 1500);
        return;
    }

    try {
        // Request connection
        const response = await provider.connect();
        walletPublicKey = response.publicKey.toString();
        walletConnected = true;
        walletProvider = provider;

        // Update UI and fetch balance
        updateWalletUI();
        await fetchBalance();
        startBalancePolling();
        showMessage('Wallet conectat! ✅');

        // Setup disconnect listener
        provider.on('disconnect', () => {
            walletConnected = false;
            walletPublicKey = null;
            solBalance = 0;
            stopBalancePolling();
            updateWalletUI();
            updateBalanceDisplay();
            showMessage('Wallet deconectat');
        });

        // Store in localStorage
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletPublicKey', walletPublicKey);

    } catch (err) {
        console.error('Wallet connection error:', err);
        showMessage('Eroare la conectare: ' + err.message);
    }
}

async function disconnectWallet() {
    if (walletProvider) {
        try {
            await walletProvider.disconnect();
        } catch (e) {
            console.log('Disconnect error:', e);
        }
    }
    walletConnected = false;
    walletPublicKey = null;
    walletProvider = null;
    solBalance = 0;
    stopBalancePolling();
    updateWalletUI();
    updateBalanceDisplay();
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletPublicKey');
    showMessage('Wallet deconectat');
}

function updateWalletUI() {
    // Header elements
    const headerBtn = document.getElementById('header-wallet-btn');
    const headerText = document.getElementById('header-wallet-text');

    // Multiplayer screen elements
    const walletRequired = document.getElementById('wallet-required');
    const walletConnectedEl = document.getElementById('wallet-connected');
    const mpWalletAddress = document.getElementById('mp-wallet-address');
    const mpOptions = document.getElementById('mp-options');

    if (walletConnected && walletPublicKey) {
        // Shorten address
        const shortAddr = walletPublicKey.slice(0, 4) + '...' + walletPublicKey.slice(-4);

        // Update header button
        if (headerBtn) {
            headerBtn.classList.add('connected');
            headerBtn.onclick = disconnectWallet;
        }
        if (headerText) headerText.textContent = shortAddr;

        // Update multiplayer screen
        if (walletRequired) walletRequired.classList.add('hidden');
        if (walletConnectedEl) {
            walletConnectedEl.classList.remove('hidden');
            if (mpWalletAddress) mpWalletAddress.textContent = shortAddr;
        }
        if (mpOptions) mpOptions.classList.remove('hidden');

        // Update balance display
        updateBalanceDisplay();
    } else {
        // Not connected
        if (headerBtn) {
            headerBtn.classList.remove('connected');
            headerBtn.onclick = connectWallet;
        }
        if (headerText) headerText.textContent = 'Connect Wallet';

        // Update multiplayer screen
        if (walletRequired) walletRequired.classList.remove('hidden');
        if (walletConnectedEl) walletConnectedEl.classList.add('hidden');
        if (mpOptions) mpOptions.classList.add('hidden');

        // Update balance display
        updateBalanceDisplay();
    }
}

function checkSavedWallet() {
    // Check if previously connected
    const saved = localStorage.getItem('walletConnected');
    if (saved === 'true') {
        // Try to auto-connect
        const provider = window.phantom?.solana || window.solana;
        if (provider && provider.isConnected) {
            walletPublicKey = provider.publicKey?.toString();
            if (walletPublicKey) {
                walletConnected = true;
                walletProvider = provider;
                updateWalletUI();
                fetchBalance();
                startBalancePolling();
            }
        }
    }
}

// ==========================================
// BALANCE & HEADER FUNCTIONS
// ==========================================

function showWalletHeader() {
    const header = document.getElementById('wallet-header');
    if (header) {
        header.classList.remove('hidden');
        header.classList.add('visible');
    }
}

async function fetchSolPrice() {
    try {
        const response = await fetch(COINGECKO_API);
        const data = await response.json();
        solPrice = data.solana?.usd || 0;
        updateBalanceDisplay();
    } catch (err) {
        console.log('Could not fetch SOL price:', err);
        solPrice = 120; // Fallback price
    }
}

async function fetchBalance() {
    if (!walletConnected || !walletPublicKey) return;

    try {
        const response = await fetch(SOLANA_RPC, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getBalance',
                params: [walletPublicKey]
            })
        });

        const data = await response.json();
        if (data.result) {
            const oldBalance = solBalance;
            solBalance = data.result.value / 1e9; // Convert lamports to SOL
            updateBalanceDisplay(oldBalance !== solBalance);
        }
    } catch (err) {
        console.log('Could not fetch balance:', err);
    }
}

function updateBalanceDisplay(animate = false) {
    const balanceConnected = document.getElementById('balance-connected');
    const balanceNotConnected = document.querySelector('.balance-not-connected');
    const solBalanceEl = document.getElementById('sol-balance');
    const usdValueEl = document.getElementById('usd-value');

    if (walletConnected && walletPublicKey) {
        if (balanceNotConnected) balanceNotConnected.classList.add('hidden');
        if (balanceConnected) {
            balanceConnected.classList.remove('hidden');

            // Format balance
            const formattedSol = solBalance.toFixed(4);
            const usdValue = (solBalance * solPrice).toFixed(2);

            if (solBalanceEl) solBalanceEl.textContent = `${formattedSol} SOL`;
            if (usdValueEl) usdValueEl.textContent = `≈ $${usdValue}`;

            // Animate if balance changed
            if (animate) {
                balanceConnected.classList.add('updated');
                setTimeout(() => balanceConnected.classList.remove('updated'), 600);
            }
        }
    } else {
        if (balanceNotConnected) balanceNotConnected.classList.remove('hidden');
        if (balanceConnected) balanceConnected.classList.add('hidden');
    }
}

function startBalancePolling() {
    // Clear any existing interval
    if (balanceInterval) clearInterval(balanceInterval);

    // Poll every 30 seconds
    balanceInterval = setInterval(() => {
        if (walletConnected) {
            fetchBalance();
        } else {
            clearInterval(balanceInterval);
        }
    }, 30000);
}

function stopBalancePolling() {
    if (balanceInterval) {
        clearInterval(balanceInterval);
        balanceInterval = null;
    }
}

// ==========================================
// MULTIPLAYER FUNCTIONS
// ==========================================

function showMultiplayerOptions() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('multiplayer-screen').classList.add('active');

    // Update wallet UI based on connection status
    updateWalletUI();

    // Reset UI
    document.getElementById('room-code-display').classList.add('hidden');
    document.getElementById('join-room-form').classList.add('hidden');
    document.getElementById('matchmaking-status').classList.add('hidden');
}

function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function createRoom() {
    roomCode = generateRoomCode();
    isHost = true;
    isMultiplayer = true;

    // Show room code
    document.getElementById('mp-options').classList.add('hidden');
    document.getElementById('room-code-display').classList.remove('hidden');
    document.getElementById('code-box').textContent = roomCode;

    // Store room in localStorage for simple P2P simulation
    localStorage.setItem(`room_${roomCode}`, JSON.stringify({
        host: walletPublicKey || 'anonymous',
        hostShort: walletPublicKey ? walletPublicKey.slice(0, 4) + '..' + walletPublicKey.slice(-4) : 'Anonim',
        created: Date.now(),
        board: null,
        status: 'waiting'
    }));

    // Check for opponent joining (poll)
    checkForOpponent();

    showMessage('Cameră creată! Trimite codul prietenului.');
}

function checkForOpponent() {
    const checkInterval = setInterval(() => {
        const roomData = localStorage.getItem(`room_${roomCode}`);
        if (roomData) {
            const room = JSON.parse(roomData);
            if (room.guest) {
                clearInterval(checkInterval);
                opponentConnected = true;
                showMessage('Adversar conectat! Începem...');
                setTimeout(() => startMultiplayerGame(), 1500);
            }
        }
    }, 1000);

    // Timeout after 5 minutes
    setTimeout(() => {
        clearInterval(checkInterval);
        if (!opponentConnected) {
            showMessage('Timeout - niciun adversar');
            localStorage.removeItem(`room_${roomCode}`);
        }
    }, 300000);
}

function copyRoomCode() {
    navigator.clipboard.writeText(roomCode).then(() => {
        showMessage('Cod copiat!');
    }).catch(() => {
        showMessage('Copiază manual: ' + roomCode);
    });
}

function showJoinRoom() {
    document.getElementById('mp-options').classList.add('hidden');
    document.getElementById('join-room-form').classList.remove('hidden');
    document.getElementById('room-code-input').focus();
}

function joinRoom() {
    const inputCode = document.getElementById('room-code-input').value.toUpperCase();

    if (inputCode.length !== 4) {
        showMessage('Codul trebuie să aibă 4 caractere');
        return;
    }

    // Check if room exists
    const roomData = localStorage.getItem(`room_${inputCode}`);
    if (!roomData) {
        showMessage('Camera nu există');
        return;
    }

    const room = JSON.parse(roomData);
    if (room.guest) {
        showMessage('Camera este plină');
        return;
    }

    // Join room
    roomCode = inputCode;
    isHost = false;
    isMultiplayer = true;

    room.guest = walletPublicKey || 'anonymous';
    room.guestShort = walletPublicKey ? walletPublicKey.slice(0, 4) + '..' + walletPublicKey.slice(-4) : 'Anonim';
    localStorage.setItem(`room_${roomCode}`, JSON.stringify(room));

    showMessage('Te-ai conectat! Începem...');
    setTimeout(() => startMultiplayerGame(), 1500);
}

function quickMatch() {
    document.querySelector('.multiplayer-options').style.display = 'none';
    document.getElementById('matchmaking-status').classList.remove('hidden');

    // Look for available rooms
    let foundRoom = null;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('room_')) {
            const room = JSON.parse(localStorage.getItem(key));
            if (room.status === 'waiting' && !room.guest && Date.now() - room.created < 300000) {
                foundRoom = key.replace('room_', '');
                break;
            }
        }
    }

    if (foundRoom) {
        // Join existing room
        document.getElementById('room-code-input').value = foundRoom;
        joinRoom();
    } else {
        // Create new room
        setTimeout(() => {
            document.getElementById('matchmaking-status').classList.add('hidden');
            createRoom();
        }, 2000);
    }
}

function cancelMatchmaking() {
    document.getElementById('matchmaking-status').classList.add('hidden');
    document.querySelector('.multiplayer-options').style.display = 'flex';

    if (roomCode) {
        localStorage.removeItem(`room_${roomCode}`);
        roomCode = null;
    }
}

function startMultiplayerGame() {
    isMultiplayer = true;
    initBoard();

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('game-screen').classList.add('active');

    document.getElementById('difficulty-display').textContent = isHost ? 'Tu: Alb (Host)' : 'Tu: Negru (Guest)';

    // Host plays as white (1), Guest plays as black but waits
    if (isHost) {
        currentPlayer = 1;
        enableRoll();
    } else {
        currentPlayer = 1; // White starts
        document.getElementById('roll-btn').disabled = true;
    }

    renderBoard();
    updateMultiplayerTurn();

    // Start sync polling
    if (!isHost) {
        pollForMoves();
    }
}

function updateMultiplayerTurn() {
    const display = document.getElementById('turn-display');
    const isMyTurn = (isHost && currentPlayer === 1) || (!isHost && currentPlayer === -1);

    if (isMyTurn) {
        display.textContent = 'Tura ta';
        display.style.background = '#14F195';
        document.getElementById('roll-btn').disabled = false;
    } else {
        display.textContent = 'Tura adversarului';
        display.style.background = '#9945FF';
        document.getElementById('roll-btn').disabled = true;
    }
}

function syncGameState() {
    if (!isMultiplayer || !roomCode) return;

    const roomData = localStorage.getItem(`room_${roomCode}`);
    if (roomData) {
        const room = JSON.parse(roomData);
        room.board = board;
        room.dice = dice;
        room.currentPlayer = currentPlayer;
        room.lastUpdate = Date.now();
        localStorage.setItem(`room_${roomCode}`, JSON.stringify(room));
    }
}

function pollForMoves() {
    const pollInterval = setInterval(() => {
        if (gameOver || !isMultiplayer) {
            clearInterval(pollInterval);
            return;
        }

        const roomData = localStorage.getItem(`room_${roomCode}`);
        if (roomData) {
            const room = JSON.parse(roomData);
            if (room.board && room.lastUpdate) {
                const isMyTurn = (isHost && room.currentPlayer === 1) || (!isHost && room.currentPlayer === -1);

                // Update local state if opponent moved
                if (JSON.stringify(board) !== JSON.stringify(room.board)) {
                    board = room.board;
                    dice = room.dice;
                    currentPlayer = room.currentPlayer;
                    renderBoard();
                    updateMultiplayerTurn();
                }
            }
        }
    }, 500);
}

// Override endTurn for multiplayer
const originalEndTurn = endTurn;
endTurn = function () {
    if (isMultiplayer) {
        currentPlayer = currentPlayer === 1 ? -1 : 1;
        syncGameState();
        updateMultiplayerTurn();

        if (!isHost && currentPlayer === 1) {
            pollForMoves();
        } else if (isHost && currentPlayer === -1) {
            pollForMoves();
        }
    } else {
        originalEndTurn();
    }
};

// Override makeMove for multiplayer sync
const originalMakeMove = makeMove;
makeMove = function (from, to) {
    originalMakeMove.call(this, from, to);
    if (isMultiplayer) {
        syncGameState();
    }
};
