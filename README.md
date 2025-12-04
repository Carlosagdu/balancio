# Balancio – Shared Expenses Dashboard

Minimal Next.js 14 prototype for creating friend groups, logging evenly split expenses, and tracking who owes whom.

## Stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS + shadcn-inspired UI primitives
- next-themes for dark/light support

## Quick start
```bash
npm install
npm run dev
```
Open http://localhost:3000 and use the “New group” action to invite friends before exploring the dashboard.

## Project structure
- `app/` – App Router pages (`page.tsx` dashboard, `groups/new` onboarding)
- `components/` – UI primitives, theme toggle/provider, create-group card
- `lib/` – helpers and utilities

## Status
UI demo only; backend mutations and auth are not wired yet.
