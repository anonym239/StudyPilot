# StudyPilot

StudyPilot ist eine deutschsprachige Lernplattform für Studierende mit täglichem Lernplan, Kursen, Karteikarten, Quiz und Prüfungsvorbereitung.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/studypilot run dev` — run the StudyPilot frontend
- `pnpm --filter @workspace/studypilot run build` — create the Netlify-ready static build
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- Frontend: `artifacts/studypilot`
- API: `artifacts/api-server/src/routes`
- API contract: `lib/api-spec/openapi.yaml`
- Netlify config: `netlify.toml`, `netlify/functions`
- Deployment setup: `README.md`, `.env.example`

## Architecture decisions

- The app always remains explorable through its built-in demo mode when external services are not configured.
- Browser code only receives public `VITE_*` values; privileged Supabase, Stripe, and AI credentials remain server-side.
- The Replit Express API and Netlify Function expose compatible `/api` routes so the frontend can move between hosts without a rewrite.

## Product

The current MVP includes the public marketing site, pricing and legal pages, demo login/signup, dashboard, courses, course detail, learning plan, flashcards, quiz, exams, progress, subscription, and settings.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
