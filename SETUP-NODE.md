# Cum să am acces la npm din Cursor

Ca asistentul să poată rula `npm install` și `npm run dev` din Cursor, trebuie să îi dai o singură dată calea către Node/npm.

## Pas unic (în Terminalul tău)

1. Deschide **Terminal** (în macOS: Cmd+Space → scrie „Terminal”).
2. Rulează:

```bash
cd /Users/claudiunae/cursor-ai
dirname $(which npm) > .cursor-node-path
```

3. Gata. După asta, când îți cer să „rulez comenzile”, voi folosi scriptul `run-npm.sh`, care citește calea din `.cursor-node-path` și rulează npm.

## Verificare

În Terminal poți verifica că fișierul există:

```bash
cat /Users/claudiunae/cursor-ai/.cursor-node-path
```

Ar trebui să vezi un path de genul: `/Users/claudiunae/.nvm/versions/node/v20.x.x/bin` sau `/usr/local/bin`.

## Dacă nu ai Node/npm

Instalează Node de pe https://nodejs.org (LTS), sau cu `brew install node`. După instalare, rulează din nou comenzile de mai sus.
