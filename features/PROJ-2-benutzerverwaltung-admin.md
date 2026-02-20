# PROJ-2: Benutzerverwaltung (Admin)

## Status: In Review
**Created:** 2026-02-20
**Last Updated:** 2026-02-20

## Dependencies
- Requires: PROJ-1 (Benutzerauthentifizierung) – Admin muss eingeloggt sein

## Beschreibung
Administratoren können im Admin-Bereich neue Benutzerkonten anlegen, bestehende Benutzer einsehen und verwalten, Passwörter zurücksetzen und Konten löschen. Reguläre Mitarbeiter haben keinen Zugang zu diesem Bereich.

## User Stories
- Als Admin möchte ich neue Mitarbeiterkonten anlegen (Name, E-Mail, Passwort, Rolle), damit neue Mitarbeiter die App nutzen können.
- Als Admin möchte ich eine Übersicht aller Benutzer sehen (Name, E-Mail, Rolle, letzter Login), damit ich den Überblick über aktive Nutzer behalte.
- Als Admin möchte ich das Passwort eines Mitarbeiters zurücksetzen (neues Passwort setzen), damit der Mitarbeiter sich wieder einloggen kann.
- Als Admin möchte ich einen Benutzer löschen/deaktivieren, wenn ein Mitarbeiter das Unternehmen verlässt, damit kein unbefugter Zugang mehr möglich ist.
- Als Admin möchte ich die Rolle eines Benutzers ändern können (z. B. Mitarbeiter → Admin), damit flexible Rollenverteilung möglich ist.

## Acceptance Criteria
- [ ] Admin-Bereich ist nur für Nutzer mit Admin-Rolle zugänglich (403 für alle anderen)
- [ ] Formular zum Anlegen eines neuen Benutzers: Vorname, Nachname, E-Mail, Passwort, Rolle (Admin/Mitarbeiter)
- [ ] Alle Pflichtfelder werden validiert (E-Mail-Format, Passwort-Mindestlänge 8 Zeichen)
- [ ] Bestehende Benutzer werden in einer Liste angezeigt (Name, E-Mail, Rolle, Status)
- [ ] Admin kann für jeden Benutzer ein neues Passwort setzen (Bestätigungsdialog)
- [ ] Admin kann einen Benutzer löschen (Bestätigungsdialog mit Warnmeldung)
- [ ] Ein Admin kann sich nicht selbst löschen
- [ ] E-Mail-Adressen müssen eindeutig sein (Fehlermeldung bei Duplikat)
- [ ] Alle Aktionen geben Bestätigungs- oder Fehlermeldungen auf Deutsch aus

## Edge Cases
- Was passiert, wenn der letzte Admin gelöscht werden soll? → Löschen verhindern, Fehlermeldung anzeigen
- Was passiert bei doppelter E-Mail-Adresse? → Fehlermeldung „Diese E-Mail-Adresse ist bereits vergeben"
- Was passiert mit den Zeiteinträgen eines gelöschten Mitarbeiters? → Zeiteinträge bleiben erhalten (historische Daten), Benutzer wird deaktiviert (nicht hart gelöscht)
- Was passiert, wenn ein Admin die eigene Rolle ändert? → Eigene Rolle kann nicht geändert werden (Schutz)
- Was passiert bei sehr kurzem Passwort beim Reset? → Validierungsfehler, Mindestlänge 8 Zeichen erzwingen

## Technical Requirements
- Sicherheit: Rollenprüfung server-seitig (nicht nur client-seitig)
- DSGVO: Gelöschte/deaktivierte Benutzer werden als inaktiv markiert, nicht sofort hart gelöscht (Aufbewahrungspflicht für Zeitdaten)
- Passwörter: Nur als Hash gespeichert, niemals im Klartext

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Komponentenstruktur

```
/admin  (geschützt – nur Admin-Rolle)
└── AdminPage
    ├── Seitentitel "Benutzerverwaltung"
    ├── "Neuer Benutzer"-Button → öffnet NeuerBenutzerDialog
    ├── BenutzerTabelle
    │   ├── Kopfzeile: Name | E-Mail | Rolle | Status | Aktionen
    │   └── BenutzerZeile (pro Nutzer)
    │       ├── Name (Vorname + Nachname)
    │       ├── E-Mail
    │       ├── Rollen-Badge  (Admin / Mitarbeiter)
    │       ├── Status-Badge  (Aktiv / Inaktiv)
    │       └── Aktionen-Dropdown
    │           ├── Passwort zurücksetzen  → PasswortResetDialog
    │           ├── Rolle ändern           → RolleÄndernDialog
    │           └── Benutzer deaktivieren  → DeaktivierenDialog
    └── Dialoge (modale Fenster, jeweils mit Abbrechen-Option)
        ├── NeuerBenutzerDialog
        │   └── Felder: Vorname, Nachname, E-Mail, Passwort, Rolle
        ├── PasswortResetDialog
        │   └── Felder: Neues Passwort, Passwort bestätigen
        ├── RolleÄndernDialog
        │   └── Feld: Neue Rolle auswählen (Dropdown)
        └── DeaktivierenDialog
            └── Warnmeldung (Zeitdaten bleiben erhalten)
```

### Datenspeicherung

**Neue Datenbanktabelle: `profiles`**

Ergänzt die von Supabase verwaltete Auth-Tabelle mit anwendungsspezifischen Daten:

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | UUID (PK) | Identisch mit der Supabase Auth User-ID |
| first_name | Text | Vorname |
| last_name | Text | Nachname |
| role | Text | `'admin'` oder `'employee'` |
| is_active | Boolean | `true` = aktiv, `false` = deaktiviert (Soft-Delete) |
| created_at | Timestamp | Anlagezeitpunkt |
| updated_at | Timestamp | Letzter Änderungszeitpunkt |

**Keine separate Passwort-Speicherung** – Passwörter werden ausschließlich von Supabase Auth verwaltet (bcrypt-Hash).

### Seitenstruktur

| Route | Sichtbarkeit | Beschreibung |
|-------|-------------|--------------|
| `/admin` | Nur Admin-Rolle | Benutzerverwaltung |
| `/api/admin/users` | Nur Admin-Rolle (server) | Benutzer anlegen & auflisten |
| `/api/admin/users/[id]/password` | Nur Admin-Rolle (server) | Passwort zurücksetzen |
| `/api/admin/users/[id]/role` | Nur Admin-Rolle (server) | Rolle ändern |
| `/api/admin/users/[id]` | Nur Admin-Rolle (server) | Benutzer deaktivieren |

### Technische Entscheidungen

| Entscheidung | Warum |
|---|---|
| **`profiles`-Tabelle** für Rollen & Namen | Supabase Auth (`auth.users`) lässt sich nicht direkt um eigene Felder erweitern. Eine eigene Tabelle gibt uns volle Kontrolle. |
| **Supabase Admin API** (Service-Role-Key) für User-Verwaltung | Nur der Server-seitige Admin-Schlüssel darf Auth-Nutzer anlegen, Passwörter ändern und Konten löschen. Läuft ausschließlich in API-Routen – nie im Browser. |
| **Soft-Delete** (`is_active = false`) statt hartem Löschen | DSGVO-Konformität: Zeiteinträge eines Mitarbeiters müssen erhalten bleiben. Benutzer wird gesperrt, nicht gelöscht. |
| **Rollenprüfung in API-Routen** (server-seitig) | Client-seitiger Schutz allein ist unsicher. Jede API-Route liest die Rolle aus der `profiles`-Tabelle und verweigert bei Nicht-Admin den Zugriff. |
| **Erweiterung des Proxy (Routenwächter)** für `/admin` | Der bestehende `src/proxy.ts` wird ergänzt: Bei `/admin/*`-Routen wird zusätzlich zur Login-Prüfung die Admin-Rolle geprüft. Nicht-Admins werden zu `/dashboard` weitergeleitet. |
| **Shadcn/ui Table + Dialog** | Bereits installierte Komponenten werden verwendet – kein Custom-Code nötig. |

### Neue Pakete

Keine – Supabase JS ist bereits installiert und unterstützt die Admin API über den Service-Role-Key.

## QA Test Results

**Tested:** 2026-02-20
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)
**Build Status:** PASS (Next.js 16, all routes compile without errors)

### Acceptance Criteria Status

#### AC-1: Admin-Bereich nur für Admin-Rolle zugänglich
- [x] Middleware (`supabase-middleware.ts:54-66`) checks role in profiles table for `/admin` routes
- [x] Non-admins redirected to `/dashboard` (302)
- [x] All API routes (`/api/admin/users/*`) verify admin via `verifyAdmin()` server-side
- [x] `verifyAdmin()` returns 401 for unauthenticated, 403 for non-admin users

#### AC-2: Formular zum Anlegen eines neuen Benutzers
- [x] Fields: Vorname, Nachname, E-Mail, Passwort, Rolle (Admin/Mitarbeiter)
- [x] Dialog uses shadcn/ui components (Dialog, Input, Label, Select)
- [x] Form resets on close

#### AC-3: Pflichtfelder validiert (E-Mail-Format, Passwort min. 8 Zeichen)
- [x] Client-side validation in `neuer-benutzer-dialog.tsx` (email regex, password.length < 8)
- [x] Server-side validation via Zod schema (`createUserSchema`) in API route
- [x] Password min 8 chars enforced on both client and server

#### AC-4: Benutzerliste (Name, E-Mail, Rolle, Status)
- [x] Table displays: Name (first + last), E-Mail, Rolle (Badge), Status (Badge)
- [x] Loading state with Skeleton components
- [x] Empty state message "Keine Benutzer vorhanden."
- [x] Emails fetched from auth.users and merged with profiles

#### AC-5: Passwort zurücksetzen (Bestätigungsdialog)
- [x] PasswortResetDialog with "Neues Passwort" + "Passwort bestätigen" fields
- [x] Client-side: min 8 chars + password match validation
- [x] Server-side: Zod min 8 chars + Supabase admin `updateUserById`

#### AC-6: Benutzer deaktivieren (Bestätigungsdialog mit Warnung)
- [x] DeaktivierenDialog shows warning: "Der Benutzer kann sich nicht mehr einloggen. Bestehende Zeiteinträge bleiben erhalten."
- [x] Soft-delete: `is_active = false` in profiles + auth user banned (~100 years)
- [x] Deactivate button only shown for active users

#### AC-7: Admin kann sich nicht selbst löschen
- [x] Client-side: Deactivate menu item disabled when `user.id === currentUserId`
- [x] Server-side: DELETE route checks `id === auth.userId` and returns 400

#### AC-8: E-Mail-Adressen eindeutig
- [x] Supabase Auth enforces uniqueness
- [x] Error mapped to German: "Diese E-Mail-Adresse ist bereits vergeben" (409)

#### AC-9: Alle Aktionen geben Bestätigungs- oder Fehlermeldungen auf Deutsch
- [x] Error messages: All in German (validation, server errors, network errors)
- [x] Success toasts added via `sonner`: "Benutzer erfolgreich angelegt", "Passwort erfolgreich zurückgesetzt", "Rolle erfolgreich geändert", "Benutzer erfolgreich deaktiviert", "Benutzer erfolgreich reaktiviert"

### Edge Cases Status

#### EC-1: Letzter Admin löschen verhindern
- [x] DELETE route queries active admins, blocks if count <= 1
- [x] Role change route blocks demoting last admin to employee

#### EC-2: Doppelte E-Mail-Adresse
- [x] "Diese E-Mail-Adresse ist bereits vergeben" returned on duplicate

#### EC-3: Zeiteinträge gelöschter Mitarbeiter bleiben erhalten
- [x] Soft-delete preserves all data; user marked inactive, not hard-deleted

#### EC-4: Admin eigene Rolle ändern verhindern
- [x] Client: Menu item disabled for self, dialog shows warning text
- [x] Server: `id === auth.userId` check returns 400

#### EC-5: Kurzes Passwort bei Reset
- [x] Client: `password.length < 8` check
- [x] Server: Zod `z.string().min(8)` validation

### Security Audit Results

- [x] **Authentication:** All API routes call `verifyAdmin()` which checks session via `getUser()`
- [x] **Authorization:** Admin role verified server-side from profiles table (not just client)
- [x] **RLS:** Enabled on `profiles` table with SELECT (all authenticated), INSERT/UPDATE (admins only)
- [x] **Service Role Key:** Only used server-side in `supabase-admin.ts`, never exposed to browser
- [x] **Admin Client Config:** `autoRefreshToken: false`, `persistSession: false` — correct for server-side
- [x] **Self-Protection:** Admin cannot delete self or change own role (both client + server)
- [x] **XSS:** React escaping active, no `dangerouslySetInnerHTML`, controlled inputs
- [x] **Input Validation:** Zod schemas on all POST/PUT endpoints, JSON parse in try/catch
- [x] **Security Headers:** Present in `next.config.ts` (X-Frame-Options, HSTS, etc.)
- [x] **Soft-Delete:** DSGVO-compliant, no hard deletion of user data
- [x] **Privilege escalation fixed**: `handle_new_user` trigger hardened to always set `role = 'employee'`; user creation API now explicitly sets role after creation
- [ ] **BUG: Leaked Password Protection disabled** (see BUG-5 — enable in Supabase Dashboard)

### Regression Test (PROJ-1: Benutzerauthentifizierung)

- [x] Login page still accessible at `/login`
- [x] AppLayout updated with "Verwaltung" nav link for admins — no regression
- [x] Logout flow unchanged
- [x] Middleware correctly handles both auth redirect and admin role check
- [x] Security headers still configured in `next.config.ts`

### Bugs Found

#### BUG-1: Keine Erfolgsbestätigungen nach Aktionen
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Go to `/admin`
  2. Create a new user (fill form, submit)
  3. Expected: Success toast/message "Benutzer erfolgreich angelegt"
  4. Actual: Dialog closes silently, list refreshes — no visible confirmation
- **Affects:** All actions (create, password reset, role change, deactivate)
- **AC Violation:** AC-9 requires "Bestätigungs- oder Fehlermeldungen" for all actions
- **Priority:** Fix before deployment

#### BUG-2: Privilege Escalation via Supabase Self-Signup (CRITICAL)
- **Severity:** Critical
- **Steps to Reproduce:**
  1. Obtain the Supabase project URL and anon key (exposed in browser as `NEXT_PUBLIC_*`)
  2. Call Supabase Auth signup API directly: `supabase.auth.signUp({ email, password, options: { data: { role: 'admin' } } })`
  3. The `handle_new_user` trigger reads `role` from `raw_user_meta_data` and creates a profile with `role = 'admin'`
  4. Expected: Self-signup should be disabled or role should be ignored
  5. Actual: Attacker gets admin access to the entire system
- **Root Cause:** The database trigger `handle_new_user()` trusts `raw_user_meta_data->>'role'` which is user-controlled during self-signup
- **Fix Options:**
  - **Option A (Recommended):** Disable self-signup in Supabase Dashboard (Authentication > Providers > Email > Disable "Allow new users to sign up") AND hardcode role to `'employee'` in the trigger
  - **Option B:** Hardcode `role = 'employee'` in the trigger and only allow role setting via the admin API after user creation
- **Priority:** Fix immediately

#### BUG-3: Keine Reaktivierungsmöglichkeit für deaktivierte Benutzer
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Deactivate a user via the admin panel
  2. Expected: Option to reactivate the user later
  3. Actual: No "Aktivieren" button exists. Deactivated users show "Inaktiv" status but can only get password reset or role change — neither reactivates
- **Impact:** Deactivation is effectively permanent without direct database access. If an employee returns, admin cannot reactivate them.
- **Priority:** Fix before deployment

#### BUG-4: Keine UUID-Validierung auf Route-Parameter
- **Severity:** Low
- **Steps to Reproduce:**
  1. Call `PUT /api/admin/users/not-a-uuid/password` with valid admin auth
  2. Expected: 400 Bad Request with "Invalid user ID"
  3. Actual: Request proceeds to Supabase, returns unclear error
- **Impact:** Poor error messages for malformed requests
- **Priority:** Fix in next sprint

#### BUG-5: Leaked Password Protection deaktiviert
- **Severity:** Low
- **Steps to Reproduce:**
  1. Check Supabase Security Advisor
  2. Expected: Leaked password protection enabled
  3. Actual: Warning "Leaked Password Protection Disabled"
- **Remediation:** Enable in Supabase Dashboard — see [docs](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
- **Priority:** Fix in next sprint

### Bug Fix Status
| Bug | Status | Fix |
|-----|--------|-----|
| BUG-1: Keine Erfolgsbestätigungen | ✅ Fixed | `toast.success()` added to all 4 dialogs via `sonner`; `<Toaster />` added to root layout |
| BUG-2: Privilege Escalation via Self-Signup | ✅ Fixed | `handle_new_user` trigger hardened (always `role = 'employee'`); POST route sets role explicitly after creation |
| BUG-3: Keine Reaktivierungsmöglichkeit | ✅ Fixed | `PATCH /api/admin/users/[id]` added; `AktivierenDialog` created; "Reaktivieren" menu item added for inactive users |
| BUG-4: Keine UUID-Validierung | ✅ Fixed | UUID regex validation added to all three `[id]` route handlers |
| BUG-5: Leaked Password Protection | ⚠️ Manual | Enable in Supabase Dashboard → Authentication → Password Settings |

### Summary
- **Acceptance Criteria:** 9/9 passed
- **Edge Cases:** 5/5 passed
- **Bugs Found:** 5 total — 4 fixed in code, 1 requires manual Supabase Dashboard action
- **Security:** PASS (after BUG-2 fix)
- **Regression (PROJ-1):** PASS — no regressions found
- **Production Ready:** YES (pending BUG-5 manual fix in Supabase Dashboard)
- **Recommendation:** Enable Leaked Password Protection in Supabase Dashboard, then run `/deploy`

## Deployment
_To be added by /deploy_
