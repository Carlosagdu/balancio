# Balancio – Shared Expenses Dashboard

Minimal Next.js 14 prototype for creating friend groups, logging evenly split expenses, and tracking who owes whom.

## Stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS + shadcn-inspired UI primitives
- Prisma ORM (PostgreSQL target)
- next-themes for dark/light support

## Quick start
```bash
npm install
npm run dev
```
Open http://localhost:3000 and use the “New group” action to invite friends before exploring the dashboard.

Prisma users: duplicate `.env.example` to `.env`, update `DATABASE_URL`, launch `docker compose up -d`, then run `npm run prisma:generate` (and `npx prisma migrate dev` when you add models).

## Project structure
- `app/` – App Router pages (`page.tsx` dashboard, `groups/new` onboarding)
- `components/` – UI primitives, theme toggle/provider, create-group card
- `prisma/` – Prisma schema + migrations
- `lib/` – helpers (e.g., `prisma.ts`, `utils.ts`)

## Status
UI demo only; backend mutations and auth are not wired yet.
