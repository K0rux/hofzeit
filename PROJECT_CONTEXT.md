# Project Context

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 3 + shadcn/ui |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Forms | react-hook-form + Zod validation |
| Icons | lucide-react |
| Deployment | Vercel |

## Folder Structure

```
hofzeit/
├── src/
│   ├── app/                  # Next.js App Router pages & layouts
│   │   ├── layout.tsx        # Root layout (fonts, global providers)
│   │   ├── page.tsx          # Home page
│   │   └── globals.css       # Global styles + Tailwind directives
│   ├── components/
│   │   └── ui/               # shadcn/ui components (do not modify directly)
│   ├── hooks/                # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   └── lib/
│       ├── supabase.ts       # Supabase client (singleton)
│       └── utils.ts          # Tailwind class merging utility (cn)
├── features/                 # Feature specifications (PROJ-X-name.md)
│   └── INDEX.md              # Feature status tracker
├── docs/
│   └── PRD.md                # Product Requirements Document
├── public/                   # Static assets
├── .env.local.example        # Environment variable template
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript config (strict mode enabled)
└── components.json           # shadcn/ui configuration
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Description | Where to find it |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase dashboard > Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Supabase dashboard > Project Settings > API |

> `NEXT_PUBLIC_` prefix means these values are exposed in the browser. Never put secret keys (service role key, etc.) with this prefix.

## Key Conventions

- **Path alias:** `@/` maps to `src/` — use `import { Button } from "@/components/ui/button"`
- **shadcn/ui first:** Before building any UI, check `src/components/ui/` for existing components
- **Feature tracking:** All features tracked in `features/INDEX.md` with IDs like `PROJ-1`, `PROJ-2`
- **Commit format:** `feat(PROJ-X): description` / `fix(PROJ-X): description`

## Development Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Start production server (run build first)
```

## Next Steps

1. **Fill in `docs/PRD.md`** — describe what you're building, target users, and core features
2. **Set up Supabase** — create a project at [supabase.com](https://supabase.com), then add credentials to `.env.local`
3. **Run `/requirements`** — define your first feature spec (`PROJ-1`)
4. **Run `/architecture`** — design the technical approach
5. **Run `/frontend`** — build UI components
6. **Run `/backend`** — create database tables, API routes, and RLS policies
7. **Run `/qa`** — test and security audit
8. **Run `/deploy`** — ship to Vercel
