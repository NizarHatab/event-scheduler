# Event Scheduler

A scalable event management app built with **Next.js**, **TypeScript**, and **SQLite** (Turso/libSQL for Vercel). It includes user accounts, invitations, status tracking, search, calendar view, AI-powered suggestions, and iCal export.

## Features

- **Event management**: Create, edit, and delete events (title, date/time, location, description). Create from dashboard modals or from the calendar by clicking a day.
- **Status tracking**: Mark your response as **Upcoming**, **Attending**, **Maybe**, or **Declined** from the event card or the event detail slide-over.
- **Search & filters**: Find events by title, date range, location, or status (debounced for smoother typing).
- **User accounts**: Register and sign in (credentials). Edit your name from the header: click your user pill (top right) → **Edit profile** opens a right-side panel.
- **Invitations**: Invite others by email; they get a link to accept or decline. Pending invitations appear on the dashboard.
- **Calendar view**: Month calendar with **Today** button and proper week grid. Click a **day** to create an event with that date; click an **event** to open its detail on the dashboard (`?eventId=`).
- **AI features**:
  - **Quick add**: Type natural language (e.g. “Team standup Monday 9am”, “Dinner tomorrow 7pm”) to create events.
  - **AI suggestions**: Optional title/description/location suggestions in the form (OpenAI or built-in fallbacks).
- **Conflict detection**: When editing an event, the form warns if the new time overlaps other events.
- **Export**: Download events as an iCal file (`.ics`) for Google Calendar, Apple Calendar, etc.
- **UI/UX**: Custom app icon/favicon, theme toggle (light/dark), responsive header with user menu (Edit profile, Sign out) and mobile menu, iCal export via button, toasts for actions, event detail slide-over, Edit Profile as a right-side slide-over panel, confirm modal for delete, loading skeletons, empty states. **Quick filters** (All / Today / This week). **Next up** card for the nearest upcoming event. **Keyboard shortcut**: ⌘N (Mac) or Ctrl+N (Windows) for new event.

## Tech stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Drizzle ORM** + **SQLite** via **Turso** (libSQL) for Vercel compatibility
- **NextAuth.js v5** (credentials)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the example env and set at least `AUTH_SECRET` and optionally `NEXTAUTH_URL`:

```bash
cp .env.example .env
```

Edit `.env`:

- `AUTH_SECRET` – Required. Use `openssl rand -base64 32` to generate.
- `NEXTAUTH_URL` – e.g. `http://localhost:3000` for local, or your production URL.
- For **local dev**, the app uses a local SQLite file (`./local.db`) if `TURSO_DATABASE_URL` is not set.
- For **Vercel**, set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` (see [Turso](https://turso.tech)).
- Optional: `OPENAI_API_KEY` for AI suggestions.

### 3. Run migrations

Migrations run automatically during `npm run build`. To run them manually:

```bash
npm run db:migrate
```

### 4. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, then create and manage events.

## Deploy to Vercel

1. **Create a Turso database** (for SQLite in the cloud):
   - [Turso](https://turso.tech) – create a database and get `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.

2. **Push to GitHub** and import the repo in Vercel.

3. **Configure environment variables** in Vercel:
   - `AUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` = `https://your-app.vercel.app`
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - Optional: `OPENAI_API_KEY`

4. **Deploy**. The build runs `db:migrate` then `next build`, so the Turso DB is migrated automatically.

## Scripts

| Script          | Description                    |
|----------------|--------------------------------|
| `npm run dev`  | Start dev server               |
| `npm run build`| Run migrations + Next.js build |
| `npm run start`| Start production server        |
| `npm run db:migrate` | Run DB migrations        |
| `npm run db:generate` | Generate Drizzle migrations (after schema change) |

## Project structure

- `src/app/` – App Router pages and API routes (events, auth, invitations, AI suggest/parse-event, export)
- `src/components/` – Header, EventCard, EventForm, SearchFilters, InviteModal, Modal, ConfirmModal, EventDetailSlideOver, EditProfileModal (right-side panel), QuickAddBar, InvitationsList, Toast, ThemeToggle, EventListSkeleton
- `src/lib/` – DB client, auth config, migrations
- `src/types/` – Shared TypeScript types
- `drizzle/` – SQL migrations

## License

MIT
