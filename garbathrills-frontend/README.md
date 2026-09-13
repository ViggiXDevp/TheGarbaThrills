# TheGarbaThrills — Frontend

React + TypeScript (Vite) frontend for the TheGarbaThrills matchmaking app. Handles the full user experience: auth, profile management, swiping, matches, and chat — wrapped in a custom "romantic + royal" festive theme.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
   Set `VITE_API_URL` to your backend URL (`http://localhost:5000/api` for local dev).

3. Run in development:
   ```
   npm run dev
   ```
   App runs on `http://localhost:5173`.

## Pages

| Route | Description |
|---|---|
| `/signup` | Create account (name, email, password, gender) |
| `/login` | Log in |
| `/forgot-password` | Request a password reset link |
| `/reset-password?token=...` | Set a new password (link comes from email) |
| `/profile-setup` | Forced onboarding for new users (photos, bio, interests) |
| `/` | Home menu (Profile / Browse / Likes / Matches) — protected |
| `/profile` | View and edit your own profile |
| `/user/:userId` | View another user's public, read-only profile |
| `/swipe` | Swipe deck — like or pass on profiles |
| `/likes` | See who's liked you |
| `/matches` | List of matches with last message preview and unread badges |
| `/chat/:matchId` | Chat window — text, stickers, GIFs, search, block/report/clear |

All routes except auth pages are protected and redirect to `/login` if not authenticated.

## Key Components

- **PhotoManager** — shared photo upload/remove/replace UI used in profile setup and editing
- **InterestTagPicker** — shared interest-tag selector
- **FestiveBackgroundArt** — hand-designed original SVG art (mandalas, diyas, dandiya sticks, paisleys) rendered as page backgrounds, responsive across screen sizes
- **MatchModal** — celebration overlay shown on a new match, with animation and a randomized congratulatory message
- **StickerPicker / GifPicker** — chat sticker selector and debounced Giphy GIF search
- **ConfirmDialog** — generic reusable confirmation modal (used for block/unblock/clear chat)

## Chat Window Highlights

- Polls for new messages every 2.5s with optimistic message appending on send
- In-chat message search with highlight and jump-to-message navigation
- 3-dot menu: Search, Clear Chat, Block/Unblock, View Contact
- Block/report flow: blocking prompts an optional report reason; if the other user has blocked you, the input is replaced with a status banner
- "Scroll to bottom" floating button appears when scrolled up more than 80px

## Deploying to Vercel

1. Push this repo to GitHub (already done if you're reading this from the deployed monorepo).
2. On Vercel: **New Project → import the repo** (framework preset: Vite).
3. Since this is a monorepo, set **Root Directory** to `garbathrills-frontend`.
4. Add environment variable `VITE_API_URL` pointing to your deployed Northflank backend (e.g. `https://your-backend.northflank.app/api`).
5. Deploy. Once live, update the backend's `FRONTEND_URL` env var to this Vercel URL so CORS and cookies work correctly.

## Status

All phases complete: authentication, profile management, swipe/match/likes/filters, chat (text/sticker/GIF), block/report, and production deployment.
