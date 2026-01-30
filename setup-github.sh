#!/bin/bash
# Rulează: cd /Users/claudiunae/cursor-ai && bash setup-github.sh
# (După ce Xcode Command Line Tools sunt instalate.)

set -e
cd "$(dirname "$0")"

echo "→ git init..."
git init

echo "→ git add ."
git add .

echo "→ git commit..."
git commit -m "Initial commit"

echo "→ branch main..."
git branch -M main

echo "→ remote origin..."
git remote add origin https://github.com/clawmvp/ai.git 2>/dev/null || git remote set-url origin https://github.com/clawmvp/ai.git

echo "→ git push (poate cere username/parolă sau token)..."
git push -u origin main

echo "Gata."
