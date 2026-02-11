# HofZeit - Zeiterfassungs-App

> **Moderne Zeiterfassungs-Lösung** für Mitarbeiter und Admins mit JWT-basierter Authentication und PostgreSQL-Backend.

**Aktueller Status:**
- ✅ **User Authentication** - Login, Logout, Passwort-Reset (Backend + Frontend Complete)
- ✅ **PostgreSQL Database** - Drizzle ORM mit Type-Safe Queries
- ✅ **JWT Sessions** - Sichere Authentifizierung mit HttpOnly Cookies
- ✅ **SMTP E-Mail** - Passwort-Reset via eigener SMTP-Server
- ✅ **Rate Limiting** - Brute-Force-Schutz für Login & Reset
- ✅ **shadcn/ui** - Moderne UI-Komponenten
- 🚧 **Zeiterfassung** - In Planung (PROJ-2)
- 🚧 **Admin-Panel** - In Planung (PROJ-3)

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. PostgreSQL einrichten

Siehe [BACKEND_SETUP.md](BACKEND_SETUP.md) für detaillierte Anleitung.

**Kurzversion:**
```bash
# PostgreSQL lokal installieren oder Cloud-Anbieter nutzen (Supabase, Neon, Railway)
# Datenbank "hofzeit" erstellen
```

### 3. Environment Variables konfigurieren

```bash
cp .env.local.example .env.local
# Dann .env.local ausfüllen:
# - DATABASE_URL
# - JWT_SECRET
# - SMTP_* (für E-Mail-Versand)
```

### 4. Database Migrations ausführen

```bash
npm run db:generate
npm run db:push
```

### 5. Test-User erstellen

```bash
# Passwort-Hash generieren
npx tsx scripts/hash-password.ts admin123

# Dann User in Drizzle Studio einfügen
npm run db:studio
```

### 6. Development Server starten

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) und logge dich ein!

### 4. Use AI Agents

⚠️ **Important:** Agents are **not Skills** – you can't call them with `/requirements-engineer`!

**How to use Agents:**

```
Hey Claude, read .claude/agents/requirements-engineer.md and create a feature spec for [your idea].
```

**Full Guide:** See [HOW_TO_USE_AGENTS.md](HOW_TO_USE_AGENTS.md)

**Available Agents:**
- `requirements-engineer.md` - Feature Specs with interactive questions
- `solution-architect.md` - PM-friendly Tech Design (no code snippets)
- `frontend-dev.md` - UI Components + Automatic Backend/QA Handoff
- `backend-dev.md` - APIs + Database + **Performance Best Practices**
- `qa-engineer.md` - Testing + Regression Tests
- `devops.md` - Deployment + **Production-Ready Essentials**

---

## Project Structure

```
ai-coding-starter-kit/
├── .claude/
│   └── agents/              ← 6 AI Agents (Production-Ready)
├── features/                ← Feature Specs (includes specs, test results, deployment status)
│   └── README.md
├── src/
│   ├── app/                 ← Pages (Next.js App Router)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/          ← React Components
│   │   └── ui/              ← shadcn/ui components (add as needed)
│   └── lib/                 ← Utility functions
│       ├── supabase.ts      ← Supabase Client (commented out by default)
│       └── utils.ts
├── public/                  ← Static files
├── PROJECT_CONTEXT.md       ← Project Documentation (fill this out!)
├── TEMPLATE_CHANGELOG.md    ← Template Version History (v1.0 - v1.3)
├── HOW_TO_USE_AGENTS.md     ← Agent Usage Guide
├── .env.local.example       ← Environment Variables Template
└── package.json
```

---

## Production-Ready Features ⚡

This template includes production-readiness guides integrated into the agents:

### DevOps Agent includes:
- **Error Tracking Setup** (Sentry) – 5-minute setup with code examples
- **Security Headers** (XSS/Clickjacking Protection) – Copy-paste `next.config.js`
- **Environment Variables Best Practices** – Secrets management
- **Performance Monitoring** (Lighthouse) – Built-in Chrome DevTools

### Backend Agent includes:
- **Database Indexing** – Make queries 10-100x faster
- **Query Optimization** – Avoid N+1 problems with Supabase joins
- **Caching Strategy** – Next.js `unstable_cache` examples
- **Input Validation** – Zod schemas for API safety
- **Rate Limiting** – Optional Upstash Redis setup

All guides are **practical** with **copy-paste code examples** – no theory!

---

## Agent-Team Workflow

### 1. Requirements Phase
```bash
# Tell Claude:
"Read .claude/agents/requirements-engineer.md and create a feature spec for [your idea]"
```

Agent asks questions → You answer → Agent creates Feature Spec in `/features/PROJ-1-feature.md`

### 2. Architecture Phase
```bash
# Tell Claude:
"Read .claude/agents/solution-architect.md and design the architecture for /features/PROJ-1-feature.md"
```

Agent designs PM-friendly Tech Design (no code!) → You review

### 3. Implementation Phase
```bash
# Frontend:
"Read .claude/agents/frontend-dev.md and implement /features/PROJ-1-feature.md"

# Backend (if using Supabase):
"Read .claude/agents/backend-dev.md and implement /features/PROJ-1-feature.md"
```

**Note:** Frontend Agent automatically checks if Backend is needed and hands off to QA when done!

### 4. Testing Phase
```bash
# Tell Claude:
"Read .claude/agents/qa-engineer.md and test /features/PROJ-1-feature.md"
```

Agent tests all Acceptance Criteria → Adds test results to feature spec

### 5. Deployment Phase
```bash
# Tell Claude:
"Read .claude/agents/devops.md and deploy to Vercel"
```

Agent guides you through deployment + Production-Ready setup (Error Tracking, Security, Performance)

---

## Tech Stack

| Category | Tool | Why? |
|----------|------|------|
| **Framework** | Next.js 16 | React + App Router + Server Actions |
| **Language** | TypeScript | Type Safety |
| **Styling** | Tailwind CSS | Utility-First CSS |
| **UI Library** | shadcn/ui | Accessible Components |
| **Database** | PostgreSQL | Relational Database |
| **ORM** | Drizzle ORM | Type-Safe SQL Queries |
| **Auth** | Custom JWT | Volle Kontrolle, keine Vendor-Lock-In |
| **E-Mail** | SMTP (nodemailer) | Eigener Mail-Server oder Provider |
| **Rate Limiting** | Upstash/In-Memory | Brute-Force-Schutz |
| **Deployment** | Vercel | Zero-Config Next.js Hosting |

---

## Next Steps

1. **Fill out PROJECT_CONTEXT.md**
   - Define your vision
   - Add features to roadmap

2. **Build your first feature**
   - Use Requirements Engineer for Feature Spec
   - Follow the Agent-Team workflow

3. **Add shadcn/ui components** (as needed)
   ```bash
   npx shadcn@latest add button
   npx shadcn@latest add card
   # etc.
   ```

4. **Production Setup** (first deployment)
   - Follow DevOps Agent guides:
     - Error Tracking (Sentry) – 5 minutes
     - Security Headers (`next.config.js`) – Copy-paste
     - Performance Check (Lighthouse) – Chrome DevTools

5. **Deploy**
   - Push to GitHub
   - Connect with Vercel
   - Use DevOps Agent for deployment help

---

## What's Included

### ✅ Works out-of-the-box

- Next.js 16 with App Router
- TypeScript (strict mode)
- Tailwind CSS (configured)
- ESLint 9 (Next.js defaults)
- 6 Production-Ready AI Agents
- Feature Changelog System (Code-Reuse!)
- Project Structure (best practices)
- Environment Variables Setup
- .gitignore (Node modules, .env, etc.)

### 📦 You add yourself

- shadcn/ui Components (as needed)
- Supabase Setup (optional)
- Your Features (with Agent-Team)
- Production Setup (Error Tracking, Security Headers)

---

## Why This Template?

### For Product Managers
- **No deep tech background needed** – Agents explain in PM-friendly language
- **Automatic handoffs** – Frontend → Backend Check → QA (no manual coordination)
- **Production-ready** – Security, Performance, Error Tracking included

### For Solo Founders
- **Build faster** – Agents handle Requirements → Deployment
- **Built for scale** – Database indexing, query optimization, caching
- **MVP to Production** – One template for both

### For Small Teams (2-5 people)
- **Consistent workflow** – Everyone follows the same agent system
- **Code reuse** – Git history shows what exists, prevents duplication
- **Knowledge sharing** – All decisions documented in Feature Specs

---

## Documentation

### Backend Documentation
- [BACKEND_SETUP.md](BACKEND_SETUP.md) – Komplette Setup-Anleitung
- [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) – API-Endpoints Reference
- [features/PROJ-1-user-authentication.md](features/PROJ-1-user-authentication.md) – Feature Spec

### AI Agent Docs
- [HOW_TO_USE_AGENTS.md](HOW_TO_USE_AGENTS.md) – Agent usage guide
- [features/README.md](features/README.md) – Feature spec format

### External Docs
- [Next.js Docs](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

---

## Scripts

```bash
# Development
npm run dev              # Start development server (localhost:3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run db:generate      # Generate migrations from schema
npm run db:push          # Push schema changes to database
npm run db:studio        # Open Drizzle Studio (GUI)

# Testing
npm run test:smtp        # Test SMTP connection
```

---

## Template Versions

**Current:** v1.4.0 (Git-Based Workflow)

See [TEMPLATE_CHANGELOG.md](TEMPLATE_CHANGELOG.md) for full version history.

**Updates:**
- v1.4.0 – Git-Based Workflow (removed FEATURE_CHANGELOG, test-reports)
- v1.3.0 – Production-Ready Guides (Error Tracking, Security, Performance)
- v1.2.0 – Agent System Improvements (Interactive Questions, PM-Friendly Output)
- v1.1.0 – Enhanced Documentation
- v1.0.0 – Initial Release

---

## License

MIT License – feel free to use for your projects!

---

**Built with AI Agent Team System + Claude Code** 🚀

Ready to build production-ready apps? Start with the Requirements Engineer!

```bash
"Read .claude/agents/requirements-engineer.md and create a feature spec for [your idea]"
```
