#!/bin/bash

# Quick setup script for Solana Tabla Pro
# Installs all dependencies needed for testing

echo "🎲 Solana Tabla Pro - Quick Setup"
echo "=================================="
echo ""

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew not found. Installing..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo "✅ Homebrew already installed"
fi

# Install Node.js
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    brew install node
    echo "✅ Node.js installed: $(node --version)"
else
    echo "✅ Node.js already installed: $(node --version)"
fi

# Install Solana CLI
if ! command -v solana &> /dev/null; then
    echo "⚡ Installing Solana CLI..."
    sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
    echo "✅ Solana CLI installed: $(solana --version)"
else
    echo "✅ Solana CLI already installed: $(solana --version)"
fi

# Install Rust
if ! command -v rustc &> /dev/null; then
    echo "🦀 Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
    echo "✅ Rust installed: $(rustc --version)"
else
    echo "✅ Rust already installed: $(rustc --version)"
fi

# Install Anchor
if ! command -v anchor &> /dev/null; then
    echo "⚓ Installing Anchor..."
    cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
    avm install 0.29.0
    avm use 0.29.0
    echo "✅ Anchor installed: $(anchor --version)"
else
    echo "✅ Anchor already installed: $(anchor --version)"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Configure Solana for devnet:"
echo "   solana-keygen new --outfile ~/.config/solana/id.json"
echo "   solana config set --url https://api.devnet.solana.com"
echo "   solana airdrop 2"
echo ""
echo "2. Deploy the project:"
echo "   cd /Users/claudiunae/antigravity/solana-tabla-pro"
echo "   ./scripts/deploy.sh devnet"
echo ""
echo "3. Test components:"
echo "   Backend:  cd backend && npm install && npm run dev"
echo "   Mobile:   cd mobile && npm install && npm run android"
echo ""
