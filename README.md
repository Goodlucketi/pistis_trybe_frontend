# Pistis Trybe — Frontend

The frontend for **Pistis Trybe**, a faith-based community app: a news feed, groups, a Bible reader, daily devotionals, real-time messaging, user profiles, and an admin dashboard.

Built with **React 19 + Vite**, styled with **Tailwind CSS v4**, and backed by a Node.js/Express API.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19, Vite 7 (SWC), React Router 7 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Data fetching | TanStack React Query (queries + mutations) |
| HTTP | Axios (single instance with auth/error interceptors) |
| Real-time | Socket.IO client (chat, keep-alive) |
| Auth | JWT + Google OAuth (`@react-oauth/google`) |
| State | Zustand + `localStorage` |
| UI helpers | lucide-react, recharts, emoji-picker-react, react-toastify, date-fns |

## Getting Started

```bash
npm install
npm run dev      # start dev server on http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server (HMR) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint on the source |

## Environment Variables

Create a `.env` file in the project root (a `.env.example` is not tracked; copy the keys below):

| Variable | Required | Purpose |
|---|---|---|
| `VITE_API_URL` | ✓ | Backend base URL (e.g. `https://pistis-trybe-backend.onrender.com/v1`) |
| `VITE_GOOGLE_CLIENT_ID` | ✓ | Google OAuth client ID (only the **client ID** is needed client-side) |
| `VITE_SOCKET_URL` | | Socket.IO server URL; defaults to the backend origin |

> **Security note:** only `VITE_*-prefixed` variables are bundled into the client and therefore available to the browser. Never put OAuth client **secrets** or any server-side credential in `.env` — anything prefixed `VITE_` is shipped publicly in the build.

## Deployment

- **Frontend:** hosted on **Vercel**. The [vercel.json](vercel.json) rewrites all routes to `/` (SPA fallback) and sets cross-origin isolation headers.
- **Backend:** hosted on **Render** (`VITE_API_URL`). A socket keep-alive ping runs in the app to keep the free-tier instance warm.

## Project Structure

```
src/
  api/        # Axios instance + interceptors
  auth/       # Route guards (ProtectedRoute, AdminProtectedRoute)
  services/   # One service module per domain (Auth, Post, Chat, Group, …)
  hooks/      # useSocket, useForm, useErrorToast, …
  community/  # Main app layout, feed/bible/groups/devotional components
  pages/      # Route pages (home auth, admin/*, profile/*, messaging)
  shared/     # Reusable UI (PostCard, Btn, ErrorBoundary, …)
  store/      # Zustand stores + static data (reading plans)
```