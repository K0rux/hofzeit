# PROJ-4: Zeiterfassung

## Status: Deployed
**Created:** 2026-02-20
**Last Updated:** 2026-02-21

## Dependencies
- Requires: PROJ-1 (Benutzerauthentifizierung) – Nutzer muss eingeloggt sein
- Requires: PROJ-3 (Tätigkeiten & Kostenstellen) – Kostenstellen-Auswahlliste muss vorhanden sein

## Beschreibung
Mitarbeiter erfassen täglich ihre Arbeitszeiten als einfache Buchungen: Tätigkeit (aus Liste oder Freitext) + Kostenstelle + Dauer in Dezimalstunden. Einträge können bearbeitet und gelöscht werden. Eine Tagesübersicht zeigt alle Einträge des gewählten Tages mit Gesamtsumme. Navigation zu anderen Tagen ist möglich.

## User Stories
- Als Mitarbeiter möchte ich einen neuen Zeiteintrag anlegen (Datum, Tätigkeit, Kostenstelle, Dauer in Stunden), damit meine Arbeit korrekt dokumentiert ist.
- Als Mitarbeiter möchte ich die Tätigkeit aus meiner persönlichen Liste wählen (Dropdown), damit die Eingabe schnell und fehlerfrei ist.
- Als Mitarbeiter möchte ich bei einer einmaligen Tätigkeit einen freien Text eingeben können, ohne sie dauerhaft in die Liste aufzunehmen.
- Als Mitarbeiter möchte ich die Kostenstelle aus der Liste wählen (Dropdown).
- Als Mitarbeiter möchte ich einen Zeiteintrag bearbeiten, wenn ich einen Fehler gemacht habe.
- Als Mitarbeiter möchte ich einen Zeiteintrag löschen, wenn er versehentlich angelegt wurde.
- Als Mitarbeiter möchte ich meine Einträge des heutigen Tages auf einen Blick sehen, damit ich den Überblick behalte.
- Als Mitarbeiter möchte ich zu einem vergangenen Datum navigieren, damit ich vergessene Einträge nachtragen kann.
- Als Mitarbeiter möchte ich die Gesamtarbeitszeit des Tages automatisch berechnet sehen.

## Acceptance Criteria
- [ ] Formular für neuen Zeiteintrag: Datum (Datepicker, Standard: heute), Tätigkeit, Kostenstelle (Dropdown), Dauer (Dezimalzahl, z. B. 3.5)
- [ ] Tätigkeit kann wahlweise aus Dropdown (eigene Liste) oder als Freitext (einmalige Tätigkeit) eingegeben werden – umschaltbar per Toggle im Formular
- [ ] Alle Pflichtfelder (Datum, Tätigkeit, Kostenstelle, Dauer) werden validiert
- [ ] Dauer muss > 0 und ≤ 24 sein (Stunden)
- [ ] Tagesansicht: Alle Einträge des gewählten Tages anzeigen
- [ ] Gesamtarbeitszeit des Tages wird summiert und angezeigt
- [ ] Jeder Eintrag hat Bearbeiten- und Löschen-Schaltflächen
- [ ] Löschen erfordert Bestätigung
- [ ] Navigation zu vorherigen/nächsten Tagen möglich
- [ ] Mitarbeiter sehen nur ihre eigenen Zeiteinträge
- [ ] Formular und Liste sind auf iPhone (375px) vollständig bedienbar

## Edge Cases
- Was passiert, wenn keine Kostenstellen in der Liste vorhanden sind? → Hinweis „Bitte zuerst Kostenstellen anlegen" mit Link zur Stammdaten-Seite
- Was passiert, wenn keine Tätigkeiten in der Liste vorhanden sind? → Toggle „Einmalige Tätigkeit" ist die einzige Option; Hinweis auf Stammdaten-Seite
- Was passiert bei Dauer = 0? → Validierungsfehler „Dauer muss größer als 0 sein"
- Was passiert bei Dauer > 24? → Validierungsfehler „Maximale Dauer beträgt 24 Stunden"
- Was passiert bei einem Tag ohne Einträge? → Leerer Zustand mit Hinweis „Noch keine Einträge für diesen Tag"
- Was passiert, wenn das Datum in der Zukunft liegt? → Einträge für zukünftige Tage sind erlaubt (Nachplanung möglich)

## Technical Requirements
- Sicherheit: API-seitige Überprüfung, dass Nutzer nur eigene Einträge lesen/schreiben kann
- Performance: Tagesansicht lädt in < 300ms
- Mobil: Datepicker ist Touch-optimiert (nativer Browser-Input)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Komponentenstruktur

```
/zeiterfassung (Seite)
+-- Tagesnavigation
|   +-- [← Vorheriger Tag] Button
|   +-- Datum-Anzeige (nativer Datepicker on click)
|   +-- [Nächster Tag →] Button
|   +-- [Heute] Shortcut-Button
+-- Tagessumme-Banner
|   +-- "Gesamtarbeitszeit: X,X Stunden"
+-- Zeiteintrag-Liste
|   +-- Zeiteintrag-Karte (wiederholt pro Eintrag)
|       +-- Tätigkeit (Name aus Liste oder Freitext)
|       +-- Kostenstelle
|       +-- Dauer: X,X Std.
|       +-- [Bearbeiten] [Löschen] Buttons
+-- [+ Neuer Zeiteintrag] Button (fixiert unten auf Mobile)
+-- Leerer-Zustand ("Noch keine Einträge für diesen Tag")
+-- Fehlzustand ("Bitte zuerst Kostenstellen anlegen")
+-- Zeiteintrag-Formular-Dialog (Anlegen + Bearbeiten)
|   +-- Datum (nativer Datepicker, Standard: heute)
|   +-- Tätigkeit
|   |   +-- Toggle: [Aus Liste ↔ Einmalige Tätigkeit]
|   |   +-- Dropdown (wenn "Aus Liste")
|   |   +-- Freitext-Eingabe (wenn "Einmalige Tätigkeit")
|   +-- Kostenstelle (Dropdown)
|   +-- Dauer (Dezimalzahl, z. B. 3.5)
|   +-- [Speichern] [Abbrechen]
+-- Löschen-Bestätigungs-Dialog
```

### Datenmodell – neue Tabelle `zeiteintraege`

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | UUID | Automatisch vergeben |
| user_id | UUID | Verknüpft mit eingeloggtem Nutzer (auth.users) |
| datum | Date | Tag des Eintrags |
| taetigkeit_id | UUID (nullable) | Referenz auf `taetigkeiten` – NULL wenn Freitext |
| taetigkeit_freitext | Text (nullable) | Freitext – NULL wenn Dropdown genutzt |
| kostenstelle_id | UUID | Referenz auf `kostenstellen` |
| dauer_stunden | Decimal | Dezimalstunden, z. B. 3.5 |
| erstellt_am | Timestamp | Automatisch |
| geaendert_am | Timestamp | Automatisch |

**Datenbank-Regel:** Entweder `taetigkeit_id` oder `taetigkeit_freitext` muss gefüllt sein – nicht beide gleichzeitig.

**Sicherheit:** Row Level Security stellt sicher, dass jeder Nutzer ausschließlich seine eigenen Einträge lesen und schreiben kann.

### API-Routen

| Methode | Route | Zweck |
|---------|-------|-------|
| GET | `/api/zeiteintraege?date=YYYY-MM-DD` | Einträge des Nutzers für einen Tag |
| POST | `/api/zeiteintraege` | Neuen Zeiteintrag anlegen |
| PUT | `/api/zeiteintraege/[id]` | Zeiteintrag bearbeiten |
| DELETE | `/api/zeiteintraege/[id]` | Zeiteintrag löschen |

### Tech-Entscheidungen

| Entscheidung | Wahl | Begründung |
|-------------|------|------------|
| Datumseingabe | Nativer Browser-Datepicker | Beste Touch-Erfahrung auf iPhone, kein Zusatzpaket |
| Dauererfassung | Dezimalstunden (z. B. 3.5) | Einfaches Zahlenfeld, kein Timepicker nötig |
| Tätigkeitsfeld | Toggle Dropdown ↔ Freitext | Schnelle Eingabe für Standardfälle, Flexibilität für Ausnahmen |
| Datenspeicherung | Supabase (PostgreSQL) | Geräteübergreifend, gesichert durch RLS |
| State-Management | React useState | Ausreichend für diese Datenmenge |

### Neue Dateien

```
src/app/zeiterfassung/page.tsx
src/app/api/zeiteintraege/route.ts
src/app/api/zeiteintraege/[id]/route.ts
src/components/zeiterfassung/
  zeiteintrag-form-dialog.tsx
  zeiteintrag-karte.tsx
  tagesnavigation.tsx
  loeschen-dialog.tsx
  types.ts
```

### Abhängigkeiten
Keine neuen Pakete – alle UI-Bausteine (Dialog, Select, Button, Card, Badge, Switch) sind bereits installiert.

## QA Test Results

**Tested:** 2026-02-21
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### AC-1: Formular für neuen Zeiteintrag (Datum, Tätigkeit, Kostenstelle, Dauer)
- [x] Dialog contains Datum field with native date picker, defaults to today
- [x] Tätigkeit field present (dropdown or freitext)
- [x] Kostenstelle dropdown present
- [x] Dauer field present as decimal number input (step="0.5", inputMode="decimal")
- **PASS**

#### AC-2: Tätigkeit umschaltbar per Toggle (Dropdown ↔ Freitext)
- [x] Toggle switch present between "Aus Liste" and "Einmalig" labels
- [x] When toggle is "Aus Liste": Select dropdown renders with user's Tätigkeiten
- [x] When toggle is "Einmalig": Free text input renders with placeholder
- [x] Switching toggle clears previous selection and resets errors
- **PASS**

#### AC-3: Alle Pflichtfelder werden validiert
- [x] Empty datum shows "Datum ist erforderlich"
- [x] Empty Tätigkeit shows "Bitte eine Tätigkeit wählen" / "Tätigkeit ist erforderlich"
- [x] Empty Kostenstelle shows "Bitte eine Kostenstelle wählen"
- [x] Empty Dauer shows "Dauer ist erforderlich"
- [x] Server-side Zod validation as second layer
- **PASS**

#### AC-4: Dauer > 0 und ≤ 24
- [x] Client-side: dauer <= 0 shows "Dauer muss größer als 0 sein"
- [x] Client-side: dauer > 24 shows "Maximale Dauer beträgt 24 Stunden"
- [x] Server-side: Zod `.gt(0)` and `.max(24)` enforced
- [x] Database: CHECK constraint `dauer_stunden > 0 AND dauer_stunden <= 24`
- **PASS** (triple-layered validation)

#### AC-5: Tagesansicht zeigt alle Einträge des gewählten Tages
- [x] GET API filters by `datum = date` and `user_id = user.id`
- [x] Entries rendered as cards via `ZeiteintragKarte` component
- [x] Loading state shows skeleton placeholders
- [x] Error state shows error message
- **PASS**

#### AC-6: Gesamtarbeitszeit wird summiert und angezeigt
- [x] `gesamtStunden` calculated via `reduce` on `dauer_stunden`
- [x] Displayed in muted banner as "Gesamtarbeitszeit: X,X Std."
- [x] Hidden when no entries exist (correct UX)
- **PASS**

#### AC-7: Jeder Eintrag hat Bearbeiten- und Löschen-Schaltflächen
- [x] Each `ZeiteintragKarte` renders "Bearbeiten" and "Löschen" buttons
- [x] Both buttons have min-h-[44px] min-w-[44px] touch targets
- [x] Bearbeiten opens form dialog pre-filled with entry data
- [x] Löschen opens delete confirmation dialog
- **PASS**

#### AC-8: Löschen erfordert Bestätigung
- [x] Delete dialog shows entry name and warning message
- [x] "Abbrechen" and "Löschen" buttons present
- [x] Destructive button variant used for delete action
- [x] Loading state during deletion ("Wird gelöscht...")
- **PASS**

#### AC-9: Navigation zu vorherigen/nächsten Tagen
- [x] "←" button navigates to previous day
- [x] "→" button navigates to next day
- [x] Date display is clickable, opens native date picker
- [x] "Heute" button appears when not on current day
- **PASS**

#### AC-10: Mitarbeiter sehen nur eigene Zeiteinträge
- [x] API filters by `user_id = user.id` in GET query
- [x] RLS policies enforce `auth.uid() = user_id` on all operations (verified via SQL)
- [x] PUT/DELETE include `.eq('user_id', user.id)` double-check
- **PASS**

#### AC-11: Formular und Liste auf iPhone (375px) vollständig bedienbar
- [x] FAB is circular 56x56px on mobile, positioned fixed bottom-right
- [x] Cards use truncation for long text
- [x] Dialog fills mobile width, footer buttons stack vertically
- [x] App header navigation fits at 375px (abbreviated labels: "Zeit", "Daten") — FIXED BUG-1
- [x] Dialog uses `max-h-[90dvh] overflow-y-auto` for keyboard safety — FIXED BUG-2
- **PASS**

### Edge Cases Status

#### EC-1: Keine Kostenstellen vorhanden
- [x] Warning banner shown: "Bitte zuerst Kostenstellen anlegen" with link to /stammdaten
- [x] "Neuer Zeiteintrag" FAB hidden when no Kostenstellen
- [x] Form dialog disables submit when `kostenstellen.length === 0`
- **PASS**

#### EC-2: Keine Tätigkeiten vorhanden
- [x] Toggle is hidden, only freitext input shown
- [x] Hint text: "Keine Tätigkeiten in der Liste" with link to /stammdaten
- **PASS**

#### EC-3: Dauer = 0
- [x] Client: "Dauer muss größer als 0 sein"
- [x] Server: Zod `.gt(0)` returns same message
- [x] Database: CHECK constraint prevents storage
- **PASS**

#### EC-4: Dauer > 24
- [x] Client: "Maximale Dauer beträgt 24 Stunden"
- [x] Server: Zod `.max(24)` returns same message
- [x] Database: CHECK constraint prevents storage
- **PASS**

#### EC-5: Tag ohne Einträge
- [x] Empty state: "Noch keine Einträge für diesen Tag."
- [x] "Ersten Eintrag anlegen" button shown (unless no Kostenstellen)
- **PASS**

#### EC-6: Datum in der Zukunft
- [x] No date restriction in UI (native date picker allows future dates)
- [x] No date restriction in API (Zod validates format only)
- **PASS**

### Security Audit Results

- [x] Authentication: All endpoints check `supabase.auth.getUser()`, return 401 if not authenticated
- [x] Authorization: RLS enabled on `zeiteintraege` with SELECT/INSERT/UPDATE/DELETE policies for `auth.uid() = user_id` (verified via direct SQL query)
- [x] Input validation: Zod schemas validate all inputs; React escapes XSS in rendering
- [x] Rate limiting: 30 writes/min per user via `src/lib/rate-limit.ts` — FIXED BUG-5
- [x] Security headers: X-Frame-Options, HSTS, nosniff, Referrer-Policy all configured
- [x] Error messages: Generic messages, no internal details leaked
- [x] Database constraints: CHECK constraints on dauer, taetigkeit_check, FK constraints

**Note on SEC-5 (RLS):** The security sub-agent flagged RLS as unverifiable from code. However, direct SQL verification confirms:
- RLS is **enabled** on `zeiteintraege`
- 4 policies exist (SELECT, INSERT, UPDATE, DELETE) all using `auth.uid() = user_id`
- This is a DevOps concern (migrations not version-controlled), not an active security vulnerability.

### Responsive Design Results

| Breakpoint | Verdict |
|------------|---------|
| Mobile 375px | **PASS** (header nav uses abbreviated labels; dialog scrolls with keyboard) |
| Tablet 768px | **PASS** |
| Desktop 1440px | **PASS** (content constrained to max-w-4xl) |

### Bugs Found

#### BUG-1: App header navigation overflows on mobile (375px) — **FIXED**
- **Fix:** Abbreviated nav labels on mobile (`<span class="sm:hidden">Zeit</span>`), reduced gaps (`gap-2 sm:gap-6`, `px-2 sm:px-3`)
- **File:** `src/components/app-layout.tsx`

#### BUG-2: Dialog may clip on small screens with keyboard open — **FIXED**
- **Fix:** Added `max-h-[90dvh] overflow-y-auto` to `DialogContent`
- **File:** `src/components/zeiterfassung/zeiteintrag-form-dialog.tsx`

#### BUG-3: Missing UUID validation on `[id]` path parameter — **FIXED**
- **Fix:** UUID regex check before DB query; returns 400 for invalid IDs
- **File:** `src/app/api/zeiteintraege/[id]/route.ts`

#### BUG-4: PUT/DELETE return success even when no row affected — **FIXED**
- **Fix:** PUT uses `.select('id')` and checks `data.length === 0`; DELETE uses `{ count: 'exact' }` and checks `count === 0` — both return 404
- **File:** `src/app/api/zeiteintraege/[id]/route.ts`

#### BUG-5: No rate limiting on API endpoints — **FIXED**
- **Fix:** Created `src/lib/rate-limit.ts`; POST/PUT/DELETE limited to 30 req/min per user (429 response when exceeded)
- **Files:** `src/lib/rate-limit.ts`, `src/app/api/zeiteintraege/route.ts`, `src/app/api/zeiteintraege/[id]/route.ts`

#### BUG-6: Tagesnavigation wrapping on narrow mobile screens — **FIXED**
- **Fix:** Added `formatDateDECompact` (short weekday + day.month format); shown on mobile, full format on sm+
- **Files:** `src/components/zeiterfassung/types.ts`, `src/components/zeiterfassung/tagesnavigation.tsx`

#### BUG-7: No max-width on main content at desktop — **FIXED**
- **Fix:** Wrapped `<main>` content in `<div className="max-w-4xl mx-auto">`
- **File:** `src/components/app-layout.tsx`

#### BUG-8: RLS policies use `auth.uid()` instead of `(select auth.uid())` — **FIXED**
- **Fix:** Applied migration `fix_rls_auth_uid_subquery_caching` — all policies on `zeiteintraege`, `taetigkeiten`, and `kostenstellen` updated
- **Component:** Database (Supabase migration)

### Summary
- **Acceptance Criteria:** 11/11 passed (all bugs fixed)
- **Edge Cases:** 6/6 passed
- **Bugs Fixed:** 8/8 — 0 remaining
- **Security:** Auth, RLS, Zod validation, UUID validation, rate limiting all in place
- **Production Ready:** YES
- **Recommendation:** Ready for `/deploy`

## Deployment

**Deployed:** 2026-02-21
**Production URL:** https://hofzeit.vercel.app
**Git Tag:** v1.4.0-PROJ-4

### Deployment Checklist
- [x] `npm run build` passed
- [x] `npm run lint` passed
- [x] QA approved (11/11 AC, 8/8 bugs fixed)
- [x] All env vars in Vercel Dashboard
- [x] Database migrations applied (Supabase)
- [x] Pushed to main → Vercel auto-deployed
- [x] Git tag created and pushed
