# Gin Tracker
**Scope**: This README replaces prior selected overview docs

## Overview
Web application for tracking Gin Rummy games between two players (Brady and Jenny) with real-time score updates. Replaces manual Google Sheets tracking with a modern web interface featuring authentication, offline support, and comprehensive statistics.

## Live and Admin
- 🌐 **App URL**: https://gin.theespeys.com
- 🚀 **Netlify Dashboard**: gintracker
- 🗄️ **Supabase Console**: gintracker project
- 🔐 **Google OAuth**: GCP Console with restricted emails
- 📊 **GitHub Repo**: https://github.com/bradyespey/gin-tracker

## Tech Stack
- ⚛️ **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- 🗄️ **Backend**: Supabase (PostgreSQL + Auth)
- 🔐 **Auth**: Google OAuth with email restrictions
- 📱 **Offline**: IndexedDB + Service Workers for offline functionality
- 🚀 **Hosting**: Netlify (frontend) + Supabase (backend)
- 🎨 **UI**: Lucide React icons + responsive design with dark mode

## Quick Start
```bash
git clone https://github.com/bradyespey/gin-tracker
cd GinTracker
npm install
npm run dev
```

## Environment
Required environment variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY

# Authentication
VITE_ALLOWED_EMAILS=YOUR_EMAIL,YOUR_EMAIL_2,YOUR_EMAIL_3

# Google OAuth (configured in Supabase)
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

## Run Modes (Debug, Headless, Profiles)
- 🐛 **Debug Mode**: `npm run dev` with browser dev tools for local development
- 🌐 **Production Mode**: Deployed via Netlify with optimized builds
- 📱 **Offline Mode**: Service Worker enables full offline functionality with IndexedDB storage

## Scripts and Ops
- 🔧 **Development**: `npm run dev` — Start local development server
- 🏗️ **Build**: `npm run build` — TypeScript compilation + Vite build
- 🔍 **Lint**: `npm run lint` — ESLint code checking
- 👀 **Preview**: `npm run preview` — Preview production build locally
- 🔄 **Sync**: Automatic online/offline data synchronization

## Deploy
- 🚀 **Frontend**: Automatic via GitHub integration to Netlify
- 📦 **Build Command**: `npm run build`
- 📁 **Publish Directory**: `dist`
- 🌐 **Domains**: gin.theespeys.com (primary), gintracker.netlify.app

## App Pages / Routes
- 📊 **Dashboard** (`/`): Game statistics, recent games, and score summaries
- 🆕 **New Game** (`/new-game`): Log new Gin Rummy games with scoring options
- 📜 **Rules** (`/rules`): Gin Rummy rules and scoring explanations
- 🔐 **Auth Callback** (`/auth/callback`): OAuth flow completion handler

## Directory Map
```
GinTracker/
├── src/
│   ├── components/          # UI components (GameList, GameForm, AuthButton)
│   ├── pages/              # App pages (Dashboard, NewGame, Rules)
│   ├── context/            # AuthContext for Google OAuth
│   ├── hooks/              # Custom hooks (usePagination, useSortedGames)
│   ├── lib/                # Core utilities (gameLogic, supabase, syncManager)
│   ├── services/           # API services (gameService with offline support)
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Helper functions (dateUtils, gameUtils)
├── supabase/migrations/    # Database schema migrations
├── public/sw.js           # Service Worker for offline functionality
└── netlify.toml           # Netlify deployment configuration
```

## Troubleshooting
- 🔐 **Auth Issues**: Verify Google OAuth redirect URLs match deployed domains
- 📱 **Offline Sync**: Check IndexedDB storage and Service Worker registration
- 🗄️ **Database**: Supabase migrations handle schema updates automatically
- 🎨 **Styling**: Tailwind CSS with dark mode based on system preferences
- 📊 **Game Logic**: Scoring calculations handle Gin vs Knock scenarios with undercuts
- 🔄 **Data Sync**: Automatic sync between online Supabase and offline IndexedDB

## AI Handoff
Read this README, scan the repo, prioritize core functions and env-safe areas, keep env and rules aligned with this file. Focus on game scoring logic, offline sync functionality, and authentication flow.