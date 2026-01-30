#!/usr/bin/env bash
# Rulează npm folosind calea din .cursor-node-path (ca Cursor să găsească Node).
ROOT="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$ROOT/.cursor-node-path" ]; then
  export PATH="$(cat "$ROOT/.cursor-node-path"):$PATH"
fi
exec npm "$@"
