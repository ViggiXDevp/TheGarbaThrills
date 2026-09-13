# TheGarbaThrills — Frontend (Phase 1)

React + TypeScript (Vite) frontend. Phase 1 scope: Sign Up, Login, Forgot Password, Reset Password, and a protected Home page.

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

- `/signup` — create account (name, email, password, gender)
- `/login` — log in
- `/forgot-password` — request a reset link
- `/reset-password?token=...` — set a new password (link comes from email)
- `/` — protected home page, redirects to `/login` if not authenticated

## Deploying to Vercel

1. Push this repo to GitHub.
2. On Vercel: New Project > import the repo (framework preset: Vite).
3. Add environment variable `VITE_API_URL` pointing to your deployed Render backend (e.g. `https://your-backend.onrender.com/api`).
4. Deploy. Once live, update the backend's `FRONTEND_URL` env var to this Vercel URL so CORS and cookies work correctly.

## Next Phases (not yet built)

- Phase 2: Profile filling (photo upload, bio, interests)
- Phase 3: Swipe/list view + filters
- Phase 4: Chat
- Phase 5: Block + reporting
- Phase 6: Testing + launch
