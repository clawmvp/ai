# Solana Tabla Pro 🎲

**Mobile-first Web3 Backgammon on Solana Mobile Stack**

[![Solana](https://img.shields.io/badge/Solana-devnet-blueviolet)](https://solana.com/)
[![React Native](https://img.shields.io/badge/React%20Native-Expo-blue)](https://expo.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> **Applying for**: Solana Mobile Builder Grants Program (up to $10K + marketing support)

## 🌟 Overview

Solana Tabla Pro is a revolutionary Web3 backgammon game built for Solana Mobile Stack, optimized for the Seeker phone. Play Romanian backgammon (tabla) with real $SOL stakes, provably fair dice rolls, NFT customization, and DAO-governed tournaments.

## ✨ Features

### MUST-HAVE (MVP) ✅
- 🎲 **Provably Fair Dice**: Switchboard VRF integration for verifiable randomness
- 🌐 **Real-time Multiplayer**: WebSocket-based instant gameplay synchronization
- 📜 **Complete Backgammon Rules**: On-chain validation of all moves and game states
- 💰 **$SOL Betting**: Trustless escrow system with 5% platform fee
- 📱 **Mobile Wallet Adapter**: One-tap wallet connection (Phantom, Solflare, etc.)
- 🎨 **3D Realistic Board**: Three.js/React Three Fiber rendering with wooden table & physics
- 🏆 **Single-Elimination Tournaments**: Bracket system with prize pools
- 🖼️ **NFT Board Skins**: Metaplex integration for custom boards (3 variants: Walnut, Marble, Neon)
- 📊 **ELO Rating System**: Skill-based matchmaking and leaderboards
- 📲 **Mobile-First Design**: Landscape-optimized UI for Solana Seeker

### NICE-TO-HAVE (Roadmap) ⏳
- 🗳️ DAO governance for tournament rules
- 🍎 Cross-platform iOS support
- 👤 Advanced NFT avatars with animations
- 🎯 XP/progression system with rewards
- 👁️ Spectator mode for high-stakes games

## 🏗️ Architecture

```
solana-tabla-pro/
├── programs/tabla-game/      # Anchor smart contracts (Rust)
│   ├── Game logic & validation
│   ├── Betting escrow system
│   ├── Tournament management
│   └── NFT minting (Metaplex)
├── mobile/                    # React Native/Expo frontend
│   ├── 3D board (React Three Fiber)
│   ├── Mobile Wallet Adapter integration
│   └── Real-time multiplayer UI
└── backend/                   # WebSocket multiplayer server
    ├── Matchmaking (ELO-based)
    ├── Game room management
    └── Anti-cheat validation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Rust 1.75+
- Anchor CLI 0.29+
- Android Studio (for mobile development)
- Phantom/Solflare wallet on mobile

### Installation

**1. Clone & Install**
```bash
git clone https://github.com/clawmvp/solana-tabla-pro.git
cd solana-tabla-pro

# Install dependencies
cd mobile && npm install
cd ../backend && npm install
```

**2. Deploy Smart Contracts**
```bash
# Build Anchor programs
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Copy program ID to mobile/utils/constants.ts
```

**3. Start Backend**
```bash
cd backend
npm run dev  # Runs on port 3001
```

**4. Run Mobile App**
```bash
cd mobile
npm run android  # For Android emulator/device
```

## 📦 Deployment

### Smart Contracts (Solana)
```bash
./scripts/deploy.sh devnet  # Deploy to devnet
./scripts/deploy.sh mainnet # Deploy to mainnet
```

### Mobile App (Solana dApp Store)
1. Build release APK: `cd mobile && npm run build:android`
2. Sign APK with unique signing key (not Google Play key)
3. Submit via dApp Store publisher portal with:
   - 512x512 icon
   - 1200x600 banner
   - 4+ screenshots (1080p)
   - Privacy policy & Terms of Service

### Backend (Railway/Render)
```bash
cd backend
npm run build
# Deploy to Railway with WebSocket support
```

## 🎮 How to Play

1. **Connect Wallet**: Tap "Connect Wallet" and select your Mobile Wallet Adapter-compatible wallet
2. **Join Queue**: Choose "Quick Match" or "Ranked" with your desired stake amount
3. **Roll Dice**: Drag dice downward to roll (powered by on-chain VRF)
4. **Make Moves**: Tap checkers and destination points to move pieces
5. **Win**: First player to bear off all 15 checkers wins the pot!

## 💎 NFT Marketplace

Purchase custom board skins with SOL:
- **Walnut Classic** (Common) - 0.5 SOL
- **Marble Luxury** (Rare) - 2.0 SOL
- **Cyberpunk Neon** (Epic) - 5.0 SOL
- **Golden Dragon** (Legendary) - 15.0 SOL

All NFTs minted via Metaplex with on-chain metadata and royaltiesNFT Marketplace`.

## 🏆 Tournaments

- **Entry Fees**: 0.05 - 1.0 SOL per tournament
- **Formats**: Single-elimination brackets (8, 16, 32, 64 players)
- **Prize Distribution**: 60% winner, 30% runner-up, 10% 3rd place

## 💰 Revenue Model

1. **Platform Fee**: 5% rake on all game stakes
2. **Tournament Entry**: 10% of tournament prize pools
3. **NFT Royalties**: 2.5% on secondary marketplace sales
4. **Premium Features**: (Future) Advanced analytics subscription

**Estimated Monthly Revenue** (1,000 active players):
- Game fees: ~$2,000
- Tournament fees: ~$500
- NFT sales: ~$300
**Total**: ~$2,800/month

## 🔐 Security

- ✅ On-chain move validation via Anchor programs
- ✅ Anti-cheat detection (impossible board states, rate limiting)
- ✅ Escrow system for trustless betting
- ✅ Provably fair randomness (Switchboard VRF)
- ✅ Mobile Wallet Adapter best practices

## 📄 Grant Application

**Project**: Solana Tabla Pro
**Package**: `com.solanatabla.pro`
**Requested Amount**: $10,000
**Budget Breakdown**:
- Smart contract development & audit: $4,000
- Mobile frontend (3D, UI/UX): $3,000
- Backend multiplayer: $2,000
- Marketing materials: $1,000

**Public Goods Contribution**: Open-source WebSocket multiplayer library for Solana games (extracting reusable matchmaking/room management components)

**Milestones**:
1. ✅ Smart contracts + tests (Week 1-2)
2. ✅ MVP mobile app (Week 3-4)
3. ✅ Multiplayer integration (Week 5)
4. ⏳ Tournament system (Week 6)
5. ⏳ Mainnet launch + dApp Store submission (Week 7)

## 📜 License

MIT License - See [LICENSE](LICENSE) for details

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## 📞 Contact

- **Developer**: @clawmvp
- **Discord**: [Solana Mobile Discord](https://discord.gg/solanamobile)
- **Twitter**: @SolanaTablePro

---

Built with ❤️ for Solana Mobile Stack | Powered by Anchor, React Native & Switchboard VRF
