# StreakFlex Telegram Mini App

MVP monorepo scaffold for a Telegram habit tracker with streaks and social sharing.

## Apps

- `backend`: Express + TypeScript API for habits/check-ins.
- `bot`: Grammy bot for `/start`, template callbacks, and inline sharing.
- `webapp`: React + Vite mini app UI.
- `database`: Prisma schema and seed.
- `shared`: Shared types and constants.

## Quick Start

1. Copy env files:
   - `cp backend/.env.example backend/.env`
   - `cp bot/.env.example bot/.env`
2. Install deps in each package:
   - `cd backend && npm install`
   - `cd ../bot && npm install`
   - `cd ../webapp && npm install`
3. Prisma:
   - `cd ../database && npm install`
   - `npx prisma generate`
   - `npx prisma migrate dev --name init`
4. Run services in separate terminals:
   - `backend`: `npm run dev`
   - `bot`: `npm run dev`
   - `webapp`: `npm run dev`

## Notes

- The MVP uses Telegram WebApp init data pass-through headers (`x-telegram-user-id`) for local development.
- Replace this with strict signature verification before production.
