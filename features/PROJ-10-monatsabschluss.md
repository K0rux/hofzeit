# PROJ-10: Monatsabschluss

## Status: Deployed
**Created:** 2026-02-22
**Last Updated:** 2026-02-28

## Dependencies
- Requires: PROJ-1 (Benutzerauthentifizierung) – Nutzer muss eingeloggt sein
- Requires: PROJ-4 (Zeiterfassung) – Zeiteinträge werden nach Abschluss schreibgeschützt
- Requires: PROJ-5 (Abwesenheitsverwaltung) – Abwesenheiten werden ebenfalls schreibgeschützt

## Beschreibung
Mitarbeiter können einen abgeschlossenen Monat formal abschließen. Nach dem Abschluss können weder Zeiteinträge noch Abwesenheiten des Monats verändert oder gelöscht werden (Schreibschutz). Der Admin kann einen Abschluss bei Bedarf aufheben. Ist ein Monat 14 Tage nach seinem Ende noch nicht abgeschlossen, wird er automatisch geschlossen.

## User Stories
- Als Mitarbeiter möchte ich meinen vergangenen Monat manuell abschließen, damit meine Zeiterfassung als vollständig und unveränderlich markiert wird.
- Als Mitarbeiter möchte ich vor dem Abschluss eine Zusammenfassung des Monats sehen (Gesamtstunden, Abwesenheiten), damit ich prüfen kann, ob alles korrekt ist.
- Als Mitarbeiter möchte ich sehen, welche meiner vergangenen Monate bereits abgeschlossen sind, damit ich den Überblick behalte.
- Als Mitarbeiter möchte ich nach dem Abschluss keine Änderungen mehr an Zeiteinträgen des abgeschlossenen Monats vornehmen können, damit die Daten unveränderlich sind.
- Als Admin möchte ich den Abschluss eines Mitarbeiters aufheben können, damit Korrekturen nachträglich möglich sind (z.B. bei Fehlern).
- Als Mitarbeiter und Admin möchte ich, dass ein Monat automatisch abgeschlossen wird, wenn der Mitarbeiter es vergessen hat (14 Tage nach Monatsende).

## Acceptance Criteria
- [ ] Mitarbeiter sieht in der Zeiterfassungs-Übersicht für jeden vergangenen Monat einen Status: „Offen" oder „Abgeschlossen"
- [ ] Mitarbeiter kann für offene vergangene Monate einen „Monat abschließen"-Button betätigen
- [ ] Vor dem Abschluss erscheint eine Bestätigungs-Zusammenfassung: Gesamtstunden, Anzahl Einträge, Anzahl Abwesenheiten, Hinweis auf Unveränderlichkeit
- [ ] Nach Bestätigung wird der Monat als abgeschlossen markiert (Timestamp, Nutzer-ID)
- [ ] Alle Zeiteinträge und Abwesenheiten des abgeschlossenen Monats sind schreibgeschützt: Bearbeiten- und Löschen-Buttons sind deaktiviert/ausgeblendet
- [ ] Neue Zeiteinträge können nicht mehr für einen abgeschlossenen Monat erstellt werden
- [ ] Abgeschlossene Monate sind visuell klar gekennzeichnet (z.B. Badge „Abgeschlossen", Schloss-Icon)
- [ ] Admin-Bereich zeigt pro Mitarbeiter den Abschluss-Status aller Monate des aktuellen Jahres
- [ ] Admin kann den Abschluss eines Monats aufheben (mit Bestätigungsdialog); der Monat wechselt zurück zu „Offen"
- [ ] Automatischer Abschluss: Ein Cron-Job oder geplanter Task schließt alle offenen Monate, die mehr als 14 Tage zurückliegen, automatisch ab
- [ ] Bei automatischem Abschluss wird kein Nutzer benachrichtigt (stille Operation), der Status ist aber in der Übersicht sichtbar
- [ ] Der laufende aktuelle Monat kann nicht abgeschlossen werden (nur vergangene Monate)
- [ ] Schreibschutz wird sowohl im Frontend als auch über RLS auf Datenbankebene durchgesetzt

## Edge Cases
- Was passiert, wenn ein Mitarbeiter den aktuellen Monat abschließen will? → Button ist nicht verfügbar für den laufenden Monat; nur vergangene Monate können abgeschlossen werden.
- Was passiert, wenn ein Monat keine Einträge hat? → Mitarbeiter kann ihn trotzdem abschließen (leerer Monat); Zusammenfassung zeigt 0 Stunden.
- Was passiert, wenn der Admin einen Monat aufhebt und der Mitarbeiter dann neue Einträge macht? → Korrekt: Einträge sind wieder editierbar bis zum nächsten Abschluss.
- Was passiert beim automatischen Abschluss mit falschen/unvollständigen Daten? → Das System schließt trotzdem ab; der Admin kann nachträglich aufheben und der Mitarbeiter kann korrigieren.
- Was passiert, wenn der Cron-Job fehlschlägt? → Offene Monate bleiben offen; beim nächsten Lauf werden sie nachgeholt.
- Was passiert mit Monaten aus vergangenen Jahren? → Dieselben Regeln gelten; auch ältere Monate können manuell abgeschlossen oder vom Admin geöffnet werden.
- Was passiert, wenn ein Mitarbeiter deaktiviert wird und offene Monate hat? → Admin kann Monate des Mitarbeiters manuell abschließen oder offen lassen.

## Technical Requirements
- Neue DB-Tabelle `monatsabschluesse` (user_id, Jahr, Monat, abgeschlossen_am, abgeschlossen_durch, automatisch boolean)
- RLS: Mitarbeiter kann eigene Abschlüsse lesen und erstellen; Admin kann alle lesen, erstellen und löschen (= aufheben)
- Schreibschutz für Zeiteinträge und Abwesenheiten: API-Routen prüfen vor jeder Mutation, ob der Monat abgeschlossen ist
- Automatischer Abschluss: Supabase Edge Function mit `pg_cron` oder externer Cron-Dienst (z.B. Vercel Cron), täglicher Lauf
- Validierung: Abschluss nur für Monate `< aktueller Monat`

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Component Structure

```
Zeiterfassung Page (existing, extended)
+-- Monats-Header (new)
|   +-- Badge "Abgeschlossen" + Schloss-Icon  ← only when closed
|   +-- Button "Monat abschließen"            ← only for past, open months
+-- Tagesnavigation (existing, unchanged)
+-- ZeiteintragKarte (existing, adapted)
|   +-- Edit/Delete-Buttons (disabled when month is closed)
+-- FAB "+ Neuer Zeiteintrag" (hidden when month is closed)
+-- MonatsabschlussDialog (new)
    +-- Summary: Gesamtstunden, Anzahl Einträge, Anzahl Abwesenheiten
    +-- Warning: "Einträge können danach nicht mehr verändert werden"
    +-- Buttons: "Endgültig abschließen" | "Abbrechen"

Admin Page (existing, extended)
+-- Neuer Tab "Monatsabschlüsse"
+-- MonatsabschlussPanel (new component)
    +-- User-Auswahl (Dropdown: alle Mitarbeiter)
    +-- Monats-Tabelle (alle 12 Monate des laufenden Jahres)
        +-- Zeile: Monat | Status-Badge | "Aufheben"-Button (wenn abgeschlossen)
        +-- AufhebenConfirmDialog (new, reuses AlertDialog)
```

### Data Model

**New Table: `monatsabschluesse`**

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Auto-generated unique ID |
| user_id | UUID | Links to the employee |
| jahr | Integer | Year, e.g. 2026 |
| monat | Integer | Month number 1–12 |
| abgeschlossen_am | Timestamp | When it was closed |
| abgeschlossen_durch | UUID | Who closed it (employee or admin) |
| automatisch | Boolean | True = auto-closed by system |

Unique constraint on (user_id, jahr, monat) – one record per employee per month.
No changes to `zeiteintraege` or `abwesenheiten` tables – closed status is always looked up from this table.

### Write-Protection Strategy (3 Layers)

| Layer | Where | Mechanism |
|-------|-------|-----------|
| 1 – Frontend | Browser | Edit/Delete buttons hidden; FAB hidden; close button only for past months |
| 2 – API Routes | Server | Before every mutation on time entries/absences, check `monatsabschluesse`. If found → 403 |
| 3 – Database RLS | Supabase | INSERT/UPDATE/DELETE policies on `zeiteintraege` and `abwesenheiten` block mutations via EXISTS subquery on `monatsabschluesse` |

### New API Routes

| Method | Route | Who | Purpose |
|--------|-------|-----|---------|
| GET | `/api/monatsabschluesse` | Employee | Fetch own closing records |
| POST | `/api/monatsabschluesse` | Employee | Close a past month |
| GET | `/api/admin/monatsabschluesse` | Admin | All users' closing records |
| DELETE | `/api/admin/monatsabschluesse/[id]` | Admin | Reopen a month |
| POST | `/api/cron/monatsabschluss` | Vercel Cron | Auto-close months older than 14 days |

### Automatic Closing

**Vercel Cron Jobs** (configured in `vercel.json`), runs daily at 02:00 UTC.
Logic: Find all user × month combinations where month end + 14 days < today and no closing record exists → insert auto-close records (automatisch = true).
Security: Cron endpoint validates a secret token from environment variables.

### Tech Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Cron mechanism | Vercel Cron Jobs | Built into Vercel, free tier, no external service |
| Write protection | 3-layer (UI + API + RLS) | Defense in depth; RLS is the database-level guarantee |
| Admin UI | New tab on existing Admin page | Keeps all admin functions together, consistent UX |
| Employee UI | Inline in Zeiterfassung page | No extra navigation, status visible in context |

### Dependencies

No new packages required – all shadcn/ui components (`Badge`, `Dialog`, `AlertDialog`, `Table`, `Tabs`) and Supabase are already installed.
One addition: `vercel.json` extended with cron schedule definition.

## QA Test Results (Round 2)

**Tested:** 2026-02-28
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)
**Scope:** Full re-test after cron feature removal and BUG-3 fix. Includes code review, RLS policy audit, and security red-team.

### Acceptance Criteria Status

#### AC-1: Mitarbeiter sieht für jeden vergangenen Monat Status "Offen" oder "Abgeschlossen"
- [x] Monats-Header appears when navigating to a past month in Zeiterfassung
- [x] Badge shows "Abgeschlossen" with Lock icon when closed
- [x] Badge shows "Offen" when not closed
- [x] No status header shown for current month (correct per spec)

#### AC-2: Mitarbeiter kann "Monat abschließen"-Button für offene vergangene Monate betätigen
- [x] "Monat abschließen" button visible only for open past months
- [x] Button hidden when month is already closed
- [x] Button disabled during loading state

#### AC-3: Bestätigungs-Zusammenfassung vor Abschluss
- [x] Dialog shows Gesamtstunden, Anzahl Einträge, Anzahl Abwesenheiten
- [x] Warning about Unveränderlichkeit displayed in amber box
- [x] Summary fetched from actual API data (not cached/stale)
- [x] Handles empty months correctly (0 hours shown)

#### AC-4: Nach Bestätigung wird Monat als abgeschlossen markiert
- [x] POST `/api/monatsabschluesse` stores timestamp via DB default `now()`
- [x] User ID stored as `abgeschlossen_durch`
- [x] `automatisch: false` for manual closings
- [x] Success toast notification shown
- [x] Status refreshed after closing

#### AC-5: Zeiteinträge und Abwesenheiten des abgeschlossenen Monats sind schreibgeschützt
- [x] **Layer 1 (Frontend):** Edit/Delete buttons hidden on ZeiteintragKarte via `readonly` prop
- [x] **Layer 2 (API):** POST/PUT/DELETE on zeiteintraege check `istMonatGeschlossen()` → 403
- [x] **Layer 2 (API):** POST/PUT/DELETE on abwesenheiten check `hatAbwesenheitGeschlosseneMonate()` → 403
- [x] **Layer 2 (API):** PUT on zeiteintraege checks BOTH old and new datum (prevents moving entries)
- [x] **Layer 2 (API):** PUT on abwesenheiten checks BOTH old and new date ranges
- [x] **Layer 1 (Frontend):** Edit/Delete buttons hidden on Abwesenheiten page via `istAbwesenheitGesperrt()`
- [x] **Layer 3 (RLS):** INSERT/UPDATE/DELETE policies on `zeiteintraege` block via EXISTS subquery (USING + WITH_CHECK)
- [x] **Layer 3 (RLS):** INSERT/UPDATE/DELETE policies on `abwesenheiten` block via EXISTS subquery with date range (USING + WITH_CHECK)

#### AC-6: Neue Zeiteinträge können nicht für abgeschlossenen Monat erstellt werden
- [x] FAB "+" button hidden in Zeiterfassung when month is closed
- [x] EmptyState action button hidden when month is closed
- [x] API POST returns 403 if month is closed
- [x] RLS INSERT policy blocks at database level

#### AC-7: Abgeschlossene Monate visuell klar gekennzeichnet
- [x] Badge with Lock icon on Zeiterfassung page
- [x] "Gesperrt" badge with Lock icon on Abwesenheiten for affected entries
- [x] Admin panel shows Lock/LockOpen icons with status badges

#### AC-8: Admin-Bereich zeigt pro Mitarbeiter den Abschluss-Status aller Monate des aktuellen Jahres
- [x] New "Monatsabschlüsse" tab on Admin page
- [x] User dropdown to select employee
- [x] 12-month table showing status for each month of current year
- [x] Future months show "–" (dash)
- [x] "(auto)" label for automatically closed months
- [x] Year selector (3 years back) — admin can navigate to previous-year months

#### AC-9: Admin kann Abschluss aufheben mit Bestätigungsdialog
- [x] "Aufheben" button visible for closed months
- [x] Confirmation dialog with warning text
- [x] DELETE `/api/admin/monatsabschluesse/[id]` removes record
- [x] Table refreshed after reopening

#### AC-10: Automatischer Abschluss via Cron-Job — DEFERRED
- [ ] Cron feature intentionally removed from scope
- [ ] No `vercel.json` cron configuration exists
- [ ] No cron endpoint exists
- **Note:** Feature deferred. Months must be closed manually by employees or admins.

#### AC-11: Automatischer Abschluss — stille Operation, Status sichtbar — DEFERRED
- [ ] Deferred along with AC-10

#### AC-12: Laufender aktueller Monat kann nicht abgeschlossen werden
- [x] Frontend: "Monat abschließen" button not shown for current month
- [x] API: Validates `monat >= currentMonth` in same year → 400
- [x] Handles year boundary correctly (past year months can be closed)

#### AC-13: Schreibschutz auf Frontend und Datenbankebene (RLS)
- [x] 3-layer protection implemented: Frontend → API → RLS
- [x] RLS enabled on all 3 tables (verified via `pg_tables.rowsecurity`)
- [x] Unique constraint `monatsabschluesse_user_id_jahr_monat_key` prevents duplicates at DB level
- [x] CHECK constraints on `jahr` and `monat` columns
- [x] Foreign keys on `user_id` and `abgeschlossen_durch`
- [x] RLS UPDATE policies verified: USING + WITH_CHECK both enforce month-closure on all 3 tables

### Edge Cases Status

#### EC-1: Aktuellen Monat abschließen
- [x] Button not available for current month; API rejects with 400

#### EC-2: Leerer Monat abschließen
- [x] Allowed; summary shows 0 Stunden, 0 Einträge, 0 Abwesenheiten

#### EC-3: Admin hebt auf → Mitarbeiter kann wieder editieren
- [x] After admin DELETE, employee can create/edit/delete entries again
- [x] All 3 layers (Frontend/API/RLS) respect the removal of the closing record

#### EC-4: Automatischer Abschluss mit unvollständigen Daten — DEFERRED
- N/A — Cron feature removed

#### EC-5: Cron-Job Fehler — DEFERRED
- N/A — Cron feature removed

#### EC-6: Monate aus vergangenen Jahren
- [x] Employee can close months from previous years via API
- [x] API validates year 2020–2100 range
- [x] Admin panel year selector added (current year - 2 to current year)

#### EC-7: Deaktivierter Mitarbeiter mit offenen Monaten
- [x] Admin can close open months for any employee via "Abschließen" button in Monatsabschlüsse tab

### Security Audit Results

- [x] **Authentication:** All endpoints verify user session via `supabase.auth.getUser()`
- [x] **Authorization (IDOR):** Employee cannot close another user's month (API hardcodes `user_id = user.id`, RLS enforces `auth.uid() = user_id`)
- [x] **Authorization (Privilege):** Employee cannot reopen months (no DELETE endpoint/policy for employees)
- [x] **Admin access:** `verifyAdmin()` + RLS admin role check via profiles table (double protection)
- [x] **Input validation:** Zod schemas on all POST bodies; UUID regex on path params
- [x] **Rate limiting:** Write operations rate-limited (30 req/min per user)
- [x] **SQL injection:** Parameterized queries via Supabase client
- [x] **XSS:** All responses are JSON; no HTML rendering of user input
- [x] **No UPDATE policy on monatsabschluesse:** Records cannot be tampered with, only created or deleted (admin)
- [x] **DB constraints:** Unique constraint, CHECK constraints, and foreign keys provide database-level safety net
- [x] **RLS UPDATE fully hardened:** Both USING and WITH_CHECK clauses enforce month-closure on `zeiteintraege` and `abwesenheiten` (migration applied 2026-02-28)

### Bugs Found

#### BUG-1: Cron job fragile duplicate handling — CLOSED (feature removed)
- **Status:** Closed — cron feature intentionally removed from scope

#### BUG-2: Cron only auto-closes months from previous year onward — CLOSED (feature removed)
- **Status:** Closed — cron feature intentionally removed from scope

#### BUG-3: Admin cannot manually close months for employees — FIXED
- **Severity:** Medium → Fixed
- **Fix:** Added `POST /api/admin/monatsabschluesse` using `createAdminClient()`. Added `AbschliessenDialog` component and "Abschließen" button in `MonatsabschlussPanel` for open past months.

#### BUG-4: Abwesenheiten page FAB always visible — CLOSED (non-issue)
- **Severity:** Low → Closed
- **Reason:** The current month is never closed by design. Employees always need the FAB to add absences for current/future dates. If a closed date range is picked in the form, the API returns a clear 403.

#### BUG-5: RLS UPDATE policies missing month-closure check on USING clause — FIXED
- **Severity:** Medium (Security) → Fixed
- **Fix:** Migration `fix_rls_update_policies_closed_months` applied 2026-02-28. Both UPDATE policies (zeiteintraege, abwesenheiten) now include the month-closure EXISTS check in the USING clause, not only the WITH_CHECK. This closes the gap where a user could move entries out of a closed month via direct Supabase REST API access.

#### BUG-6: Admin panel has no year selector — FIXED
- **Severity:** Low → Fixed
- **Fix:** Added `selectedYear` state with a year Select dropdown (current year − 2 to current year). `istZukunftsMonat()` and `kannAbgeschlossenWerden()` helpers replace the inline hardcoded `currentYear` logic. AbschliessenDialog now receives `selectedYear`. All 12 months of any selected past year are actionable.

### Regression Testing
- [x] Login/logout flow works
- [x] Zeiterfassung: Create/edit/delete entries for OPEN months still works
- [x] Abwesenheiten: Create/edit/delete for OPEN months still works
- [x] Admin: User management tab unaffected
- [x] Admin: Tabs component integrates cleanly with existing content
- [x] Build passes with zero errors (`npm run build`)

### Summary
- **Acceptance Criteria:** 9/11 passed, 2 deferred (AC-10, AC-11 — cron removed). All others pass.
- **Edge Cases:** 4/5 applicable passed (2 deferred with cron). All others pass.
- **Bugs Fixed:** BUG-3 (admin manual close), BUG-5 (RLS UPDATE gap), BUG-6 (year selector). BUG-4 closed as non-issue. BUG-1/BUG-2 closed (cron removed).
- **Bugs Remaining:** 0
- **Security:** PASS — 3-layer write-protection fully verified including RLS USING + WITH_CHECK
- **Production Ready:** YES — all bugs resolved

## Deployment

**Deployed:** 2026-02-28
**Production URL:** https://hofzeit.vercel.app
**Commit:** `feat(PROJ-10): Implement Monatsabschluss`
**DB Migrations applied:**
- `create_monatsabschluesse` (2026-02-28)
- `fix_rls_update_policies_closed_months` (2026-02-28)
