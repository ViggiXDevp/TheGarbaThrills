# TheGarbaThrills — Backend

Express + TypeScript + MongoDB API powering the TheGarbaThrills matchmaking app. Handles auth, profiles, swiping/matching, chat, and safety (block/report).

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the values:
   ```
   cp .env.example .env
   ```
   - `MONGODB_URI` — from your MongoDB Atlas cluster (Database > Connect > Drivers)
   - `JWT_SECRET` — any long random string (e.g. `openssl rand -hex 32`)
   - `RESEND_API_KEY` — from https://resend.com after creating an account
   - `EMAIL_FROM` — must be a verified sender/domain in Resend (sandbox mode only delivers to your own Resend account email)
   - `FRONTEND_URL` — where your React app runs (`http://localhost:5173` for local dev)
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET` — from your Supabase project (see setup steps below)
   - `GIPHY_API_KEY` — from https://developers.giphy.com, used server-side so the key is never exposed to the client

3. Run in development:
   ```
   npm run dev
   ```
   Server starts on `http://localhost:5000`. Health check: `GET /health`.

## API Endpoints

All routes are prefixed with `/api`. Routes marked 🔒 require authentication (httpOnly JWT cookie).

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/auth/signup` | Create account (`name`, `email`, `password`, `gender`) |
| POST | `/auth/login` | Log in (`email`, `password`) |
| POST | `/auth/logout` | Clear auth cookie |
| GET 🔒 | `/auth/me` | Get current logged-in user |
| POST | `/auth/forgot-password` | Send reset link email (`email`) |
| POST | `/auth/reset-password` | Reset password (`token`, `password`) |

### Profile
| Method | Route | Description |
|---|---|---|
| GET 🔒 | `/profile/interest-tags` | List available interest tags |
| PUT 🔒 | `/profile` | Update own profile |
| POST 🔒 | `/profile/photo` | Upload a photo (resized to 1000×1000, JPEG q80) |
| DELETE 🔒 | `/profile/photo` | Remove a photo |
| GET 🔒 | `/profile/:userId` | View another user's public profile |

### Swipe & Matches
| Method | Route | Description |
|---|---|---|
| GET 🔒 | `/swipe/deck` | Get next profiles to swipe (excludes swiped/blocked, respects mutual preference) |
| POST 🔒 | `/swipe` | Record a like/pass, detects mutual match |
| GET 🔒 | `/swipe/likes-received` | See who's liked you |
| GET 🔒 | `/matches` | List all matches with last message preview & unread count |
| GET 🔒 | `/matches/:matchId` | Get match details (partner info, block status) |

### Chat
| Method | Route | Description |
|---|---|---|
| GET 🔒 | `/chat/gifs/search?q=` | Search GIFs (Giphy, server-proxied) |
| GET 🔒 | `/chat/:matchId/messages` | Get messages for a match (respects per-user clear-chat cutoff) |
| POST 🔒 | `/chat/:matchId/messages` | Send a message (text/sticker/gif) |
| POST 🔒 | `/chat/:matchId/clear` | Clear chat history (self only, doesn't affect the other user) |
| POST 🔒 | `/chat/:matchId/read` | Mark messages as read |

### Safety
| Method | Route | Description |
|---|---|---|
| POST 🔒 | `/block/:userId` | Block a user (silent — they're never notified) |
| DELETE 🔒 | `/block/:userId` | Unblock a user |
| POST 🔒 | `/report/:userId` | Report a user (`reason`, optional `details`) |

Auth uses an httpOnly JWT cookie (7-day expiry) — no token handling needed on the client beyond `withCredentials: true` / `credentials: 'include'`.

## Deploying to Northflank

1. Push this repo to GitHub (already done if you're reading this from the deployed monorepo).
2. On Northflank: create a new project, then **Add New → Service → connect the repo**.
3. Since this is a monorepo, set **Root Directory** to `garbathrills-backend`.
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Add all `.env` variables under the service's Environment settings.
7. Once deployed, update `FRONTEND_URL` to your live Vercel frontend URL so CORS and cookies work correctly.

## Setting up Supabase Storage (photo storage, free, no credit card required)

1. Create a free account at https://supabase.com and create a new project (this also provisions a small free Postgres DB you won't use, since we're using MongoDB — that's fine, ignore it).
2. In the project sidebar, go to **Storage** → create a new bucket named exactly `GarbaThrills-Photos` (case-sensitive), and toggle it to **Public**.
3. Go to **Project Settings → API**. Copy the "Project URL" — this is your `SUPABASE_URL`.
4. On the same page, copy the **secret** key (labeled `service_role` in older Supabase UI versions — **not** the `anon`/`publishable` key) — this is your `SUPABASE_SERVICE_ROLE_KEY`. Keep this secret; it has full access to your project.
5. Photos are automatically resized/compressed (max 1000×1000, JPEG quality 80) before upload via `sharp`, so file sizes stay small and the free 1GB storage / 5GB bandwidth tier goes a long way. Accepted formats: JPEG, PNG, WebP. Max 2MB per upload.
6. Free Supabase projects pause automatically after 7 days with no activity. If that happens, just log into the Supabase dashboard once to unpause it — your data isn't lost, it just needs a manual wake-up.

## Key Implementation Notes

- **Matches endpoint is batch-optimized** — a single `Promise.all` gathers blocks, cleared chats, read receipts, and all messages in ~5 queries instead of N+1.
- **Silent blocking** — if User A blocks User B, the match disappears from A's list entirely and permanently. B is never told. This was an explicit safety design choice.
- **No-cache middleware** — all `/api/*` responses set `Cache-Control: no-store`, `Pragma: no-cache`, `Expires: 0` to prevent the browser from serving stale 304-cached data (this caused a significant bug during development — see project history).
- **CORS** — configured with `origin: FRONTEND_URL, credentials: true` to support the httpOnly cookie flow.
