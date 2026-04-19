# Gin Tracker
**Scope**: This README replaces prior selected overview docs

## Overview
Web application for tracking Gin Rummy games between two players (Brady and Jenny) with real-time score updates. Replaces manual Google Sheets tracking with a modern web interface featuring authentication, offline support, comprehensive statistics, and automated weekly backups.

Now features a **Public Demo Mode** that allows visitors to explore the application with mock data while protecting real user information.

## Live and Admin
- 🌐 **App URL**: https://gin.theespeys.com
- 🚀 **Netlify Dashboard**: gintracker
- 🗄️ **Firebase Console**: gintracker-54301 project
- 🔐 **Firebase Auth**: Google OAuth with email restrictions
- 📊 **GitHub Repo**: https://github.com/bradyespey/gin-tracker
- 💾 **Backups**: Automated weekly backups via GitHub Actions (data-backups/games.json)

## Features & Demo Mode

### Public Demo Mode
Visitors can access the site without logging in to experience the full UI:
- **Mock Data**: Uses in-memory mock games to populate the dashboard.
- **Privacy First**: Real user names are masked as "User 1" and "User 2".
- **Sandbox Environment**: Visitors can add, edit, and delete games locally without affecting the real database. Changes are reset on refresh.
- **Full Scope**: Includes access to the Dashboard, New Game form, and Game List with filtering and sorting.

### Core Features
- **Real-Time Tracking**: Log game results instantly.
- ⚛️ **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- 🗄️ **Backend**: Firebase (Firestore + Auth)
- 🔐 **Auth**: Firebase Google OAuth with email restrictions
- 📱 **Offline**: IndexedDB + Service Workers for offline functionality
- 🚀 **Hosting**: Netlify (frontend) + Firebase (backend)
- 🎨 **UI**: Lucide React icons + responsive design with dark mode
- 🔄 **Backups**: GitHub Actions + Firebase Admin SDK

## Quick Start
```bash
git clone https://github.com/bradyespey/gin-tracker
cd GinTracker
npm install
npm run dev
```

## Environment

Copy `.env.example` to `.env` and fill in values. See `.env.example` for all required variables.

### Required Environment Variables

All variables should be set in `.env` (copy from `.env.example`):


```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID

# Authentication
VITE_ALLOWED_EMAILS=YOUR_EMAIL,YOUR_EMAIL_2,YOUR_EMAIL_3
```

**Firebase Setup**:
1. Create Firebase project and enable Authentication (Google provider)
2. Create Firestore database (production mode, us-south1 region)
3. Deploy Firestore security rules: `firebase deploy --only firestore:rules`
4. Add authorized domains: localhost, gintracker.netlify.app, gin.theespeys.com

**GitHub Secrets** (for automated backups):
- `FIREBASE_SERVICE_ACCOUNT`: Full JSON content from Firebase Service Account key

## Run Modes (Debug, Headless, Profiles)
- 🐛 **Debug Mode**: `npm run dev` with browser dev tools for local development
- 🌐 **Production Mode**: Deployed via Netlify with optimized builds
- 📱 **Offline Mode**: Service Worker enables full offline functionality with IndexedDB storage

## Scripts and Ops
- 🔧 **Development**: `npm run dev` — Start local development server (port 5179)
- 🏗️ **Build**: `npm run build` — TypeScript compilation + Vite build
- 🔍 **Lint**: `npm run lint` — ESLint code checking
- 👀 **Preview**: `npm run preview` — Preview production build locally
- 🔄 **Sync**: Automatic online/offline data synchronization
- 📦 **Deploy Watch**: `npm run deploy:watch` — Push to GitHub and monitor Netlify build

## Deploy
- 🚀 **Frontend**: Automatic via GitHub integration to Netlify
- 📦 **Build Command**: `npm run build`
- 📁 **Publish Directory**: `dist`
- 🌐 **Domains**: gin.theespeys.com (primary), gintracker.netlify.app
- 🔥 **Firestore Rules**: Deploy with `firebase deploy --only firestore:rules`
- 🖼️ **Build Image**: Ubuntu Noble 24.04 (upgraded from Focal 20.04)

## App Pages / Routes
- 📊 **Dashboard** (`/gin`): Game statistics, recent games, and score summaries
- 🆕 **New Game** (`/gin/new`): Log new Gin Rummy games with scoring options
- 📜 **Rules** (`/gin/rules`): Gin Rummy rules and scoring explanations
- 🔐 **Auth Callback** (`/auth/callback`): OAuth flow completion handler

## Directory Map
```
GinTracker/
├── src/
│   ├── components/          # UI components (GameList, GameForm, AuthButton)
│   ├── pages/              # App pages (Dashboard, NewGame, Rules)
│   ├── context/            # AuthContext for Firebase Auth
│   ├── hooks/              # Custom hooks (usePagination, useSortedGames)
│   ├── lib/                # Core utilities (gameLogic, firebase, syncManager, indexedDB)
│   ├── services/           # API services (gameService with offline support)
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Helper functions (dateUtils, gameUtils, numberFormat)
├── scripts/
│   ├── backup.js          # Firebase backup script (GitHub Actions)
│   └── deploy-and-watch.sh # Netlify build monitoring script
├── .github/workflows/
│   └── backup.yml         # Weekly automated backup workflow
├── data-backups/          # Automated backup storage (git-tracked)
├── firestore.rules        # Firestore security rules
├── firebase.json          # Firebase project configuration
└── netlify.toml           # Netlify deployment configuration
```

## Key Functions

### Game Service (`src/services/gameService.ts`)
- `fetchGames()`: Retrieves games from Firestore, merges with local pending games
- `addGame()`: Creates new game (online to Firestore, offline to IndexedDB)
- `updateGame()`: Updates existing game with sync support
- `deleteGame()`: Deletes game with offline fallback

### Sync Manager (`src/lib/syncManager.ts`)
- `syncGames()`: Syncs pending local games to Firestore when online
- `triggerSync()`: Manually triggers sync operation

### Game Logic (`src/lib/gameLogic.ts`)
- `calculateScore()`: Calculates game score (Gin vs Knock scenarios)
- `calculateStats()`: Computes aggregate statistics (wins, averages, percentages)

### IndexedDB (`src/lib/indexedDB.ts`)
- `initDB()`: Initializes IndexedDB database
- `saveGameLocally()`: Saves game to local storage
- `getLocalGames()`: Retrieves all local games
- `updateGameLocally()`: Updates local game
- `deleteGameLocally()`: Deletes local game
- `getNextGameNumber()`: Calculates next game number for offline games

## Automated Backups
Weekly automated backups run via GitHub Actions every Monday at midnight Central Time:
- **Location**: `data-backups/games.json` (committed to Git)
- **Manual Trigger**: GitHub Actions → Weekly Data Backup → Run workflow
- **Verification**: Check commit history for "Automated data backup: YYYY-MM-DD"
- **Restoration**: See `Guides/Firebase Data Backup Guide.md` for restore process

## Troubleshooting
- 🔐 **Auth Issues**: Verify Firebase authorized domains include deployed URLs
- 📱 **Offline Sync**: Check IndexedDB storage and Service Worker registration
- 🗄️ **Database**: Firestore rules require authentication (deploy with `firebase deploy --only firestore:rules`)
- 🎨 **Styling**: Tailwind CSS with dark mode based on system preferences
- 📊 **Game Logic**: Scoring calculations handle Gin vs Knock scenarios with undercuts
- 🔄 **Data Sync**: Automatic sync between online Firestore and offline IndexedDB
- 💾 **Backups**: Verify GitHub Actions workflow runs successfully and commits appear

## AI Handoff
Read this README, scan the repo, prioritize core functions and env-safe areas, keep env and rules aligned with this file. Focus on game scoring logic, offline sync functionality, Firebase authentication flow, and backup system. Firestore rules enforce authentication-only access (email restrictions handled in app code).
