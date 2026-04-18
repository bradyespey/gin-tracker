# Project Context

Read README.md for full project context before making changes.

## Overview
Gin Rummy tracker with real-time scoring, Firebase auth/data, offline support, and weekly backup automation.

## Stack
React 18, TypeScript, Vite, Tailwind CSS, Firebase Auth/Firestore, IndexedDB, Service Worker, Netlify.

## Key Files
- src/services/gameService.ts
- src/lib/gameLogic.ts
- src/lib/syncManager.ts
- src/lib/indexedDB.ts
- scripts/backup.js

## Dev Commands
- Start: npm run dev
- Build: npm run build
- Deploy: npm run deploy:watch

## Local Ports
- App dev: `http://localhost:5179`
- Netlify local shell: not reserved for this repo right now

## Rules
- Do not introduce new frameworks
- Follow existing structure and naming
- Keep solutions simple and fast

## Security
- Never expose paid API keys in browser bundles, `VITE_*` vars, or client-side fetch calls
- Put LLM and other paid provider keys behind server-side functions or a backend proxy only
- Do not enable auto-reload, polling, automatic retries, or repeated background inference against paid APIs unless the user explicitly asks for it

## Notes
- Preserve offline-first behavior and sync logic between IndexedDB and Firestore.
- Demo mode uses mock data and local-only writes.
