# Quick Testing Guide - Solana Tabla Pro

## 🔧 Prerequisites Not Available

Based on system check:
- ❌ Solana CLI not installed
- ❌ Node.js not installed
- ❌ Anchor CLI not installed

## 📝 Required Installation Steps

Pentru a testa complet aplicația, trebuie instalate următoarele:

### 1. Instalare Node.js (Required pentru frontend și backend)
```bash
# Folosind Homebrew (recomandat pe macOS)
brew install node

# Sau descarcă de pe nodejs.org
# https://nodejs.org/en/download/
```

### 2. Instalare Solana CLI (Required pentru smart contracts)
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Apoi adaugă la PATH (vezi instrucțiunile din output)
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Verifică instalarea
solana --version
```

### 3. Instalare Rust și Anchor (Required pentru smart contracts)
```bash
# Instalează Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Instalează Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.29.0
avm use 0.29.0

# Verifică
anchor --version
```

## 🎮 Quick Test Options (After Installation)

### Option 1: Test Backend Only (Multiplayer Server)
```bash
cd /Users/claudiunae/antigravity/solana-tabla-pro/backend
npm install
npm run dev

# Server va rula pe http://localhost:3001
# Poți testa WebSocket endpoints cu un client
```

### Option 2: Test Mobile UI (Fără blockchain)
```bash
cd /Users/claudiunae/antigravity/solana-tabla-pro/mobile
npm install

# Pentru Android emulator
npm run android

# Sau pentru web preview
npm start
```

### Option 3: Full Deployment (Smart Contracts + Backend + Frontend)
```bash
cd /Users/claudiunae/antigravity/solana-tabla-pro

# 1. Configurează Solana wallet pentru devnet
solana-keygen new --outfile ~/.config/solana/id.json
solana config set --url https://api.devnet.solana.com

# 2. Request airdrop pentru devnet SOL
solana airdrop 2

# 3. Deploy smart contracts
./scripts/deploy.sh devnet

# 4. Start backend
cd backend && npm install && npm run dev &

# 5. Start mobile app
cd mobile && npm install && npm run android
```

## 🌐 Alternative: Use Pre-Deployed Demo

Dacă vrei să testezi rapid fără instalare:

### Frontend Demo (Static)
Cod-ul frontend poate fi vizualizat direct în folder:
- [Home Screen](file:///Users/claudiunae/antigravity/solana-tabla-pro/mobile/screens/HomeScreen.tsx)
- [Game Screen with 3D Board](file:///Users/claudiunae/antigravity/solana-tabla-pro/mobile/screens/GameScreen.tsx)
- [3D Board Component](file:///Users/claudiunae/antigravity/solana-tabla-pro/mobile/components/Board3D.tsx)

### Smart Contracts (Code Review)
Anchor programs sunt ready to deploy:
- [Main Program](file:///Users/claudiunae/antigravity/solana-tabla-pro/programs/tabla-game/src/lib.rs)
- [Game Logic](file:///Users/claudiunae/antigravity/solana-tabla-pro/programs/tabla-game/src/state.rs)
- [All Instructions](file:///Users/claudiunae/antigravity/solana-tabla-pro/programs/tabla-game/src/instructions/)

## 📊 Ce poți testa ACUM (fără dependencies)

1. **Code Review**: Verifică toate fișierele create
2. **Documentation**: Citește [README.md](file:///Users/claudiunae/antigravity/solana-tabla-pro/README.md)
3. **Architecture**: Studiază [Walkthrough](file:///Users/claudiunae/.gemini/antigravity/brain/64b8fc64-c1c8-4237-94e0-53b36ca46944/walkthrough.md)
4. **Grant Application**: Review [Grant Docs](file:///Users/claudiunae/antigravity/solana-tabla-pro/docs/GRANT_APPLICATION.md)

## 🚀 Next Steps

1. **Alege opțiunea de testing** care ți se potrivește
2. **Instalează dependencies** necesare (vezi mai sus)
3. **Rulează comenzile** pentru componenta dorită
4. **Testează funcționalitatea** locală

Dacă vrei să testez ceva specific fără instalarea full stack-ului, spune-mi ce componentă te interesează! 🎲
