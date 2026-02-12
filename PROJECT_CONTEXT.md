# HofZeit - Zeiterfassungs-System

> Zeiterfassung für kleinere Handwerksbetriebe mit Admin-Portal zur Verwaltung

## Vision
Einfaches, lokales Zeiterfassungs-System für Handwerksbetriebe. Mitarbeiter erfassen ihre Arbeitszeiten, Urlaubstage und Krankheitstage. Admins verwalten Mitarbeiter und erstellen Monatsberichte für die Prüfstelle.

---

## Aktueller Status
**PROJ-1** ✅ Complete | **PROJ-2** 🟡 Frontend Complete (Backend Pending)

---

## Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Sprache:** TypeScript
- **Styling:** Tailwind CSS
- **UI Library:** shadcn/ui (copy-paste components)

### Backend
- **Database:** PostgreSQL
- **State Management:** React useState / Context API
- **Data Fetching:** React Server Components / fetch

### Deployment
- **Hosting:** Vercel (oder Netlify)

---

## Features Roadmap

### Phase 1: Core System
- **[PROJ-1] User Authentication** → ✅ Complete → [Spec](/features/PROJ-1-user-authentication.md)
  - Login/Logout, Session Management, Password Reset
  - Status: Production Ready (Frontend + Backend + QA Tests Passed)

- **[PROJ-2] Admin - User-Verwaltung** → 🟡 In Progress → [Spec](/features/PROJ-2-admin-user-verwaltung.md)
  - Mitarbeiter anlegen/bearbeiten/deaktivieren
  - Status: ✅ Frontend Complete, ⏳ Backend Pending

- **[PROJ-3] Admin - Stammdaten-Verwaltung** → 🔵 Planned → [Spec](/features/PROJ-3-admin-stammdaten-verwaltung.md)

### Phase 2: Zeiterfassung
- **[PROJ-4] Zeiterfassung** → 🔵 Planned → [Spec](/features/PROJ-4-zeiterfassung.md)
- **[PROJ-5] Urlaub & Krankheit** → 🔵 Planned → [Spec](/features/PROJ-5-urlaub-krankheit.md)

### Phase 3: Reporting
- **[PROJ-6] Monatsabschluss** → 🔵 Planned → [Spec](/features/PROJ-6-monatsabschluss.md)
- **[PROJ-7] Admin - Zeiten-Übersicht** → 🔵 Planned → [Spec](/features/PROJ-7-admin-zeiten-uebersicht.md)
- **[PROJ-8] PDF Export** → 🔵 Planned → [Spec](/features/PROJ-8-pdf-export.md)

---

## Status-Legende
- ⚪ Backlog (noch nicht gestartet)
- 🔵 Planned (Requirements geschrieben)
- 🟡 In Review (User reviewt)
- 🟢 In Development (Wird gebaut)
- ✅ Done (Live + getestet)

---

## Development Workflow

1. **Requirements Engineer** erstellt Feature Spec → User reviewt
2. **Solution Architect** designed Schema/Architecture → User approved
3. **PROJECT_CONTEXT.md** Roadmap updaten (Status: 🔵 Planned → 🟢 In Development)
4. **Frontend + Backend Devs** implementieren → User testet
5. **QA Engineer** führt Tests aus → Bugs werden gemeldet
6. **DevOps** deployed → Status: ✅ Done

---

## Agent-Team Verantwortlichkeiten

- **Requirements Engineer** (`.claude/agents/requirements-engineer.md`)
  - Feature Specs in `/features` erstellen
  - User Stories + Acceptance Criteria + Edge Cases

- **Solution Architect** (`.claude/agents/solution-architect.md`)
  - Database Schema + Component Architecture designen
  - Tech-Entscheidungen treffen

- **Frontend Developer** (`.claude/agents/frontend-dev.md`)
  - UI Components bauen (React + Tailwind + shadcn/ui)
  - Responsive Design + Accessibility

- **Backend Developer** (`.claude/agents/backend-dev.md`)
  - Supabase Queries + Row Level Security Policies
  - API Routes + Server-Side Logic

- **QA Engineer** (`.claude/agents/qa-engineer.md`)
  - Features gegen Acceptance Criteria testen
  - Bugs dokumentieren + priorisieren

- **DevOps** (`.claude/agents/devops.md`)
  - Deployment zu Vercel
  - Environment Variables verwalten
  - Production-Ready Essentials (Error Tracking, Security Headers, Performance)

---

## Production-Ready Features

This template includes production-readiness guides integrated into the agents:

- **Error Tracking:** Sentry setup instructions (DevOps Agent)
- **Security Headers:** XSS/Clickjacking protection (DevOps Agent)
- **Performance:** Database indexing, query optimization (Backend Agent)
- **Input Validation:** Zod schemas for API safety (Backend Agent)
- **Caching:** Next.js caching strategies (Backend Agent)

All guides are practical and include code examples ready to copy-paste.

---

## Design Decisions

Document your architectural decisions here as your project evolves.

**Template:**
- **Why did we choose X over Y?**
  → Reason 1
  → Reason 2

---

## Folder Structure

```
ai-coding-starter-kit/
├── .claude/
│   └── agents/              ← 6 AI Agents (Requirements, Architect, Frontend, Backend, QA, DevOps)
├── features/                ← Feature Specs (Requirements Engineer creates these)
│   └── README.md            ← Documentation on how to write feature specs
├── src/
│   ├── app/                 ← Pages (Next.js App Router)
│   ├── components/          ← React Components
│   │   └── ui/              ← shadcn/ui components (add as needed)
│   └── lib/                 ← Utility functions
│       └── utils.ts         ← Helper functions
├── public/                  ← Static files
├── PROJECT_CONTEXT.md       ← This file - update as project grows
└── package.json
```

---

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```


2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Start using the AI Agent workflow:**
   - Tell Claude to read `.claude/agents/requirements-engineer.md` and define your first feature
   - Follow the workflow: Requirements → Architecture → Development → QA → Deployment

---

## Next Steps

1. **Define your first feature idea**
   - Think about what you want to build

2. **Start with Requirements Engineer**
   - Tell Claude: "Read .claude/agents/requirements-engineer.md and create a feature spec for [your idea]"
   - The agent will ask clarifying questions and create a detailed spec

3. **Follow the AI Agent workflow**
   - Requirements → Architecture → Development → QA → Deployment
   - Each agent knows when to hand off to the next agent

4. **Track progress via Git**
   - Feature specs in `/features/PROJ-X.md` show status (Planned → In Progress → Deployed)
   - Git commits track all implementation details
   - Use `git log --grep="PROJ-X"` to see feature history

---

**Built with AI Agent Team System + Claude Code**
