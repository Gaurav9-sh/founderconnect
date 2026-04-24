# FounderConnect

A professional networking platform connecting early-stage founders with experienced founders, mentors, and investors. Built with Next.js 14 App Router, TypeScript, Tailwind, Prisma, and NextAuth.

## Features

- **Auth**: email + password, JWT sessions via NextAuth
- **Roles**: Founder, Mentor, Investor — each gets a tailored dashboard
- **Profiles**: rich profiles with role-specific fields (check size, mentorship areas, etc.)
- **Startups**: founders create pitches; investors can filter by category/stage/funding and express interest
- **Connections**: send/accept/reject connection requests
- **Messaging**: 1:1 threads between connected users
- **Discovery feed**: search people or startups with filters
- **Notifications**: connection requests, accepts, messages, pitch interest

## Run locally

```bash
cp .env.example .env
# edit NEXTAUTH_SECRET — generate via: openssl rand -base64 32

npm install
npx prisma db push   # creates SQLite dev.db
npm run db:seed      # creates 3 demo users + 1 startup
npm run dev
```

Open http://localhost:3000.

### Demo accounts (seeded)

Password for all: `password123`

- `ada@founder.dev` — Founder with one startup (Lumen)
- `reid@mentor.dev` — Mentor / ex-CEO
- `vita@capital.vc` — Investor

## Project structure

```
app/
  (auth)/login         NextAuth credentials sign-in
  (auth)/signup        Signup with role selection
  dashboard            Role-aware dashboard
  feed                 Discovery feed (people + startups)
  profile/[id]         Public profile
  profile/edit         Edit own profile
  startups             Browse + filter startups
  startups/new         Create pitch (founders only)
  startups/[id]        Startup detail, express interest
  connections          Network + pending requests
  messages             Threads list
  messages/[userId]    1:1 thread
  api/
    auth/[...nextauth]   NextAuth handler
    register             POST create account
    profile              PUT upsert profile
    connections          GET list / POST request
    connections/[id]     PATCH accept/reject
    startups             GET list (filters) / POST create
    startups/[id]        GET / PATCH
    startups/[id]/interest  POST investor interest
    messages             GET threads / POST send
  actions.ts           Server actions for form submissions
components/            UI primitives + feature components
lib/                   prisma client, auth helpers, validation, utils
services/              user / connection / startup / message / notification
prisma/
  schema.prisma        SQLite schema
  seed.ts              Demo data
```

## Architecture notes

- **Server actions** power all form submissions; REST API routes provide programmatic access for future mobile clients or 3rd-party integrations.
- **Services** encapsulate business logic + validation (Zod). API routes and server actions are thin callers.
- **Authorization** is enforced per-action (e.g. only FOUNDERs create startups, only INVESTORs express interest, only connected users can message).
- **SQLite** is used for zero-setup; schema is Postgres-compatible — swap `provider = "postgresql"` and update `DATABASE_URL`.
- **Tailwind** with a single brand token, dark mode via `prefers-color-scheme`.

## Future scalability

- **Postgres + connection pooling** (PgBouncer/Neon) for production
- **Realtime messaging** via Pusher / Ably / Postgres LISTEN-NOTIFY instead of request-based fetches
- **Full-text search** with Postgres `tsvector` or Meilisearch for people & startups
- **File uploads** for avatars & pitch decks (S3 presigned URLs)
- **Email** (Resend) for connection/interest notifications with a digest option
- **Rate-limiting** via Upstash + middleware to prevent connection-request spam
- **Analytics** (PostHog) for funnel metrics: signups → profile completion → first connection
- **Background jobs** (Inngest / Trigger.dev) for async digests and data enrichment
- **Role-based matching** — ML ranking of recommended people / startups on the feed

## Monetization ideas

1. **Investor subscriptions** — $199/mo for advanced filters, saved searches, early-access deal flow, export CSV.
2. **Founder Pro** — $29/mo for verified badge, pitch analytics (who viewed), priority in investor feeds, unlimited connection requests.
3. **Featured pitches** — pay per placement at top of the Startups page for a category.
4. **Paid intros** — optional fee when founder books a 30-min call with a mentor; platform takes 15%.
5. **Recruiting add-on** — let mentors / operators list that they're open to CTO / co-founder roles; startups pay to contact.
6. **Data API** — paid API for ecosystem partners (accelerators, news sites).
7. **Events & cohorts** — ticketed demo days, paid peer-group cohorts for founders.

## Where to evolve next

1. **Verification**: LinkedIn OAuth + manual review for investor/mentor badges — trust is the moat.
2. **Rooms / Communities**: topic-based groups (AI, Fintech, YC S26) with discussion threads.
3. **Pitch decks & data rooms**: upload deck, control access per investor, track views.
4. **Cap table & diligence tools**: lightweight tooling to close a round end-to-end.
5. **AI assistant**: founder-facing copilot — "help me draft my pitch", "find 10 investors matching my thesis".
6. **Mobile app**: React Native + the existing REST API.

## Commands

```bash
npm run dev         # dev server
npm run build       # prisma generate + next build
npm run start       # production server
npm run db:push     # sync schema → db (dev)
npm run db:seed     # seed demo data
```
