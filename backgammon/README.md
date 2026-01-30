# Backgammon

Aplicație Backgammon: **web** (browser) și **Android** (prin Capacitor).

## Rulare în browser

```bash
npm install
npm run dev
```

Deschide http://localhost:5173 în browser.

## Build pentru producție (web)

```bash
npm run build
npm run preview
```

Fișierele pentru hosting sunt în `dist/`.

## Android

1. Instalează [Android Studio](https://developer.android.com/studio) și SDK.
2. În proiect:

```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

3. În Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s) sau rulează pe emulator/dispozitiv.

## Reguli (scurt)

- Alb mută de la 24 spre 1, negru de la 1 spre 24.
- Piesa lovită merge pe bară; trebuie reintrodusă înainte de alte mutări.
- Când toate piesele sunt în tabla de acasă, poți „scoate” cu zarul potrivit.
- Câștigă cine scoate primul toate cele 15 piese.

## Tehnologii

- React 18 + TypeScript
- Vite
- Capacitor (Android)
