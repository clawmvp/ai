#!/usr/bin/env bash
# Instalează skill-urile frontend-design și copywriting de pe skills.sh
# Rulează din rădăcina proiectului: ./skills-frontend-copywriting.sh

set -e

if ! command -v npx &>/dev/null; then
  echo "Eroare: npx nu a fost găsit. Instalează Node.js (https://nodejs.org) și încearcă din nou."
  exit 1
fi

echo "=== Instalare skill: frontend-design (anthropics/skills) ==="
npx skills add anthropics/skills --skill frontend-design

echo ""
echo "=== Instalare skill: copywriting (coreyhaines31/marketingskills) ==="
npx skills add coreyhaines31/marketingskills

echo ""
echo "Gata. Skill-urile frontend-design și copywriting sunt instalate pentru Cursor/agent."
