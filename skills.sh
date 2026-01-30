#!/usr/bin/env bash
# skills.sh - Instalare skills pentru AI agents (Cursor, Claude, etc.)
# Documentație: https://skills.sh/docs/cli
#
# Utilizare:
#   ./skills.sh                    # instalează vercel-labs/agent-skills
#   ./skills.sh frontend-copy       # instalează frontend-design + copywriting
#   ./skills.sh owner/repo         # instalează un skill specific

set -e

ARG="${1:-vercel-labs/agent-skills}"

if ! command -v npx &>/dev/null; then
  echo "Eroare: npx nu a fost găsit. Instalează Node.js (https://nodejs.org) și încearcă din nou."
  exit 1
fi

if [ "$ARG" = "frontend-copy" ] || [ "$ARG" = "frontend-copywriting" ]; then
  echo "=== Instalare frontend-design (anthropics/skills) ==="
  npx skills add anthropics/skills --skill frontend-design
  echo ""
  echo "=== Instalare copywriting (coreyhaines31/marketingskills) ==="
  npx skills add coreyhaines31/marketingskills
  echo ""
  echo "Gata. Skill-urile frontend-design și copywriting sunt instalate."
  exit 0
fi

echo "Instalare skill: $ARG"
npx skills add "$ARG"
echo ""
echo "Gata. Skill-urile sunt configurate pentru agentul tău (Cursor etc.)."
echo "Alte comenzi: npx skills find [query]  |  npx skills update"
