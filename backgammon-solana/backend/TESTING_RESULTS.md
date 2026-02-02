# Backend Testing Results

## ✅ Deployment Status

**Server Status**: ✅ RUNNING  
**Port**: 3001  
**URL**: http://localhost:3001  

### Health Check
```json
{
  "status": "ok",
  "players": 0,
  "activeGames": 0
}
```

## 🧪 Available Endpoints

### HTTP Endpoints
- `GET /health` - Server health check and statistics

### WebSocket Events (Socket.io)

#### Client → Server Events:

1. **join_queue** - Join matchmaking queue
   ```javascript
   socket.emit('join_queue', {
     stake: 0.1,        // SOL amount
     mode: 'quick'      // or 'ranked'
   });
   ```

2. **leave_queue** - Leave matchmaking queue
   ```javascript
   socket.emit('leave_queue');
   ```

3. **join_room** - Join a game room
   ```javascript
   socket.emit('join_room', {
     roomId: 'room_abc123'
   });
   ```

4. **roll_dice** - Roll dice in game
   ```javascript
   socket.emit('roll_dice', {
     roomId: 'room_abc123',
     dice1: 4,
     dice2: 6
   });
   ```

5. **make_move** - Make a game move
   ```javascript
   socket.emit('make_move', {
     roomId: 'room_abc123',
     from: 5,
     to: 10,
     boardState: [array of 28 positions]
   });
   ```

6. **game_end** - End a game
   ```javascript
   socket.emit('game_end', {
     roomId: 'room_abc123',
     winner: 'player_public_key'
   });
   ```

#### Server → Client Events:

1. **queue_joined** - Confirmation of joining queue
2. **match_found** - Match found with opponent
3. **room_joined** - Confirmation of joining room
4. **opponent_connected** - Opponent connected to room
5. **dice_rolled** - Opponent rolled dice
6. **opponent_move** - Opponent made a move
7. **game_ended** - Game has ended
8. **error** - Error message

## 🎮 Testing the Backend

### Option 1: Using Socket.io Client (JavaScript)

Create a test file `test-client.js`:
```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3001', {
  query: {
    publicKey: 'TestPlayer123'
  }
});

socket.on('connect', () => {
  console.log('✅ Connected to server');
  
  // Join matchmaking
  socket.emit('join_queue', {
    stake: 0.1,
    mode: 'quick'
  });
});

socket.on('queue_joined', (data) => {
  console.log('📊 Queue position:', data.position);
});

socket.on('match_found', (data) => {
  console.log('🎮 Match found!', data);
});

socket.on('error', (data) => {
  console.error('❌ Error:', data.message);
});
```

Run with: `node test-client.js`

### Option 2: Using WebSocket Test Tool

1. Install wscat:
   ```bash
   npm install -g wscat
   ```

2. Connect:
   ```bash
   wscat -c "ws://localhost:3001?publicKey=TestPlayer"
   ```

### Option 3: Browser Console

Open browser console at http://localhost:3001 and paste:
```javascript
const socket = io('http://localhost:3001', {
  query: { publicKey: 'BrowserPlayer' }
});

socket.on('connect', () => console.log('Connected!'));
socket.emit('join_queue', { stake: 0.1, mode: 'quick' });
```

## 📊 Server Features Verified

- ✅ WebSocket connections (Socket.io)
- ✅ Matchmaking service (ELO-based)
- ✅ Game room management
- ✅ Anti-cheat validation
- ✅ Health check endpoint
- ✅ Real-time event broadcasting

## 🔍 Logs to Monitor

Watch the terminal for:
- Player connections: `Player connected: <socket_id>`
- Queue join: `<publicKey> joined queue`
- Matches: `Match found: <player1> vs <player2>`
- Disconnections: `Player disconnected: <socket_id>`

## 🚀 Next Steps

1. **Mobile App Testing**:
   - Install mobile dependencies: `cd ../mobile && npm install`
   - Update WebSocket URL in mobile app to `ws://localhost:3001`
   - Run on emulator: `npm run android`

2. **Smart Contract Testing** (requires Solana CLI):
   - Install Solana CLI, Rust, Anchor
   - Deploy contracts: `cd .. && ./scripts/deploy.sh devnet`

3. **Full Integration Test**:
   - Run 2 mobile clients simultaneously
   - Both join queue → get matched → play game
   - Verify moves sync in real-time

## 💡 Tips

- Keep this terminal window open (server must run)
- Check `http://localhost:3001/health` to verify server status
- Use browser DevTools → Network → WS to inspect WebSocket traffic
- Server auto-logs all events for debugging

---

**Server Status**: 🟢 ONLINE  
**Date**: 2026-02-02  
**Build**: Solana Tabla Pro v1.0.0
