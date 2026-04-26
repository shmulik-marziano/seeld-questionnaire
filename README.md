# Shmuel

Personal AI chat with adaptive memory and transparent learning.

## Stack

- Next.js 14 (App Router) + TypeScript strict
- Tailwind + shadcn/ui (RTL Hebrew)
- Supabase (auth + database + RLS)
- Anthropic Claude (Opus 4.7 main, Haiku 4.5 for memory extraction)
- Stripe (billing)
- Upstash Redis (rate limiting)
- Sentry (errors)
- Tauri 2 (desktop app)
- Vercel (hosting)
- pnpm workspaces + Biome

## Layout

```
shmuel/
├── apps/
│   ├── web/       # Next.js app (marketing + auth + chat)
│   └── desktop/   # Tauri 2 desktop wrapper
└── packages/
    ├── shared-types/
    ├── memory-engine/
    ├── learning-engine/
    └── ui/
```

## Local development

```bash
pnpm install
cp apps/web/.env.local.example apps/web/.env.local   # then fill in keys
pnpm dev
```

See `HANDOFF.md` for the full setup checklist (Supabase migrations, Stripe products, Vercel env vars, etc.).
