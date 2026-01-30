# Avioane

Joc clasic **Avioane** (cu patratele), contra robot.

## Reguli

- **Grilă 10×10.** Fiecare jucător plasează 3 avioane.
- Un avion = **1 cap** (cockpit) + **4 corp** (formă T: cap sus, corp jos).
- **Plasare:** Click pe grilă pentru a pune avionul; butonul „Rotație” schimbă orientarea (0°, 90°, 180°, 270°).
- **Joc:** Trăgești pe grila inamicului (dreapta). Ratat = ·, Lovit = X, Avion doborât = toate celulele avionului.
- Dacă lovești **capul**, avionul e doborât. Dacă lovești **corpul**, mai tragi o dată.
- Câștigă cine doboară primul toate cele 3 avioane ale adversarului.

## Rulare

```bash
npm install
npm run dev
```

Deschide http://localhost:5173

## Tehnologii

- React 18 + TypeScript
- Vite
