# TheGarbaThrills — Backend (Phase 1)

Express + TypeScript + MongoDB backend. Phase 1 scope: sign up, log in, log out, "who am I", forgot password, reset password.

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
   - `EMAIL_FROM` — must be a verified sender/domain in Resend
   - `FRONTEND_URL` — where your React app runs (http://localhost:5173 for local dev)
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET` — from your Supabase project (see setup steps below)

3. Run in development:
   ```
   npm run dev
   ```
   Server starts on `http://localhost:5000`. Health check: `GET /health`.

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create account (`name`, `email`, `password`, `gender`) |
| POST | `/api/auth/login` | Log in (`email`, `password`) |
| POST | `/api/auth/logout` | Clear auth cookie |
| GET | `/api/auth/me` | Get current logged-in user (requires cookie) |
| POST | `/api/auth/forgot-password` | Send reset link email (`email`) |
| POST | `/api/auth/reset-password` | Reset password (`token`, `password`) |

Auth uses an httpOnly JWT cookie — no token handling needed on the client beyond `withCredentials: true`.

## Deploying to Northflank

1. Push this repo to GitHub.
2. On Northflank: create a new project, then "Add New" > Service > connect the repo.
3. Northflank auto-detects Node.js — build command `npm install && npm run build`, start command `npm start`.
4. Add all `.env` variables under the service's Environment settings.
5. Once deployed, update `FRONTEND_URL` to your live Vercel frontend URL, and update the frontend's `VITE_API_URL` to this Northflank URL.

## Setting up Supabase Storage (photo storage, free, no credit card required)

1. Create a free account at https://supabase.com and create a new project (this also provisions a small free Postgres DB you won't use, since we're using MongoDB — that's fine, ignore it).
2. In the project sidebar, go to Storage > create a new bucket named `garbathrills-photos`, and toggle it to **Public**.
3. Go to Project Settings > API. Copy the "Project URL" — this is your `SUPABASE_URL`.
4. On the same page, copy the `service_role` secret key (NOT the `anon` public key) — this is your `SUPABASE_SERVICE_ROLE_KEY`. Keep this secret; it has full access to your project.
5. Photos are automatically resized/compressed (max 1000x1000, JPEG quality 80) before upload, so file sizes stay small and the free 1GB storage / 5GB bandwidth tier goes a long way.
6. Free Supabase projects pause automatically after 7 days with no activity. If that happens, just log into the Supabase dashboard once to unpause it — your data isn't lost, it just needs a manual wake-up.

## Next Phases (not yet built)

- Phase 2: Profile filling (photo upload, bio, interests)
- Phase 3: Swipe/list view + filters
- Phase 4: Chat
- Phase 5: Block + reporting
- Phase 6: Testing + launch
