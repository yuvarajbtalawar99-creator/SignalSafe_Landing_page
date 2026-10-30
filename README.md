# SignalSafe Campus — Landing Page

A responsive React + TypeScript landing page with a Three.js falling-binary background.

## Requirements
- Node.js 20+ recommended
- npm

## Run locally
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
npm run preview
```

## Important
The interactive "Signal Check" is a UI preview only. It does not call a real detection backend. Connect it to your verified FastAPI endpoint before presenting it as a working threat scanner.

## Main files
- `src/App.tsx` — landing page sections and interactions
- `src/BinaryRain.tsx` — Three.js binary rain background
- `src/styles.css` — responsive dark navy/cyan design system
