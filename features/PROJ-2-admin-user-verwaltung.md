# PROJ-2: Admin - User-Verwaltung

## Status: ✅ Complete (Frontend ✅ Complete, Backend ✅ Complete)

## Überblick
Admin-Portal zur Verwaltung von Mitarbeiter-Accounts. Nur Admins können neue User anlegen, bearbeiten und deaktivieren.

## User Stories

- Als **Admin** möchte ich neue Mitarbeiter-Accounts erstellen, um neuen Mitarbeitern Zugriff zu geben
- Als **Admin** möchte ich eine Übersicht aller Mitarbeiter sehen, um den Überblick zu behalten
- Als **Admin** möchte ich Mitarbeiter-Daten bearbeiten (Name, E-Mail), um Änderungen zu pflegen
- Als **Admin** möchte ich Mitarbeiter-Accounts deaktivieren (statt löschen), um bei Austritt den Login zu sperren aber Daten zu behalten
- Als **Admin** möchte ich das Urlaubskontingent pro Mitarbeiter festlegen, um die verfügbaren Urlaubstage zu definieren
- Als **Admin** möchte ich einen Initial-Admin-Account haben, um nach der ersten Installation das System einrichten zu können

## Acceptance Criteria

### User-Liste (Frontend ✅)
- [x] Übersicht aller Mitarbeiter in einer Tabelle/Liste
- [x] Anzeige: Name, E-Mail, Rolle (Mitarbeiter/Admin), Status (Aktiv/Deaktiviert), Urlaubskontingent
- [x] Suchfunktion nach Name oder E-Mail
- [x] Sortierung nach Name, E-Mail, Status

### User erstellen (Frontend ✅, Backend ✅)
- [x] "Neuer Mitarbeiter" Button öffnet Formular
- [x] Formular-Felder:
  - Vorname (Pflichtfeld)
  - Nachname (Pflichtfeld)
  - E-Mail (Pflichtfeld, Format-Validierung)
  - Rolle (Dropdown: Mitarbeiter / Admin)
  - Initial-Passwort (Pflichtfeld, min. 8 Zeichen)
  - Urlaubskontingent (Zahl, z.B. 30 Tage/Jahr)
- [x] "Speichern" Button erstellt User-Account
- [x] Success Message: "Mitarbeiter [Name] wurde erfolgreich angelegt"
- [x] Weiterleitung zur User-Liste

### User bearbeiten (Frontend ✅, Backend ✅)
- [x] "Bearbeiten" Button bei jedem User
- [x] Bearbeiten-Formular mit vorausgefüllten Daten
- [x] Editierbare Felder: Vorname, Nachname, E-Mail, Rolle, Urlaubskontingent
- [x] Passwort-Änderung optional (leeres Feld = keine Änderung)
- [x] "Speichern" Button aktualisiert User-Daten
- [x] Success Message: "Änderungen gespeichert"

### User deaktivieren/aktivieren (Frontend ✅, Backend ✅)
- [x] "Deaktivieren" Button bei aktiven Usern
- [x] Bestätigungs-Dialog: "Möchtest du [Name] wirklich deaktivieren? Der Login wird gesperrt, aber alle Daten bleiben erhalten."
- [x] Nach Bestätigung: Status → Deaktiviert
- [x] Deaktivierte User können sich nicht mehr einloggen (bereits in PROJ-1 implementiert)
- [x] "Aktivieren" Button bei deaktivierten Usern (reaktiviert Account)

### Initial Admin (Backend ✅)
- [x] Seed Script verfügbar: `npm run seed:users`
- [x] Erstellt Test-Accounts:
  - Admin: admin@hofzeit.app / admin1234
  - Mitarbeiter: mitarbeiter@hofzeit.app / test1234
- [x] Automatischer Skip bei bereits existierenden Usern

### UX/UI (Frontend ✅)
- [x] Mobile-optimiert (responsive Tabelle/Cards)
- [x] Loading-State bei User-Operationen
- [x] Moderne, übersichtliche UI mit smooth Animationen
- [x] Validierungs-Fehler werden inline im Formular angezeigt

## Edge Cases

### Doppelte E-Mail
- **Was passiert, wenn ein Admin eine E-Mail anlegt, die bereits existiert?**
  - Error Message: "Diese E-Mail wird bereits verwendet"
  - Formular bleibt geöffnet mit Fehler-Highlighting

### Admin deaktivieren
- **Kann ein Admin sich selbst deaktivieren?**
  - Nein, Error Message: "Du kannst deinen eigenen Account nicht deaktivieren"

- **Was passiert, wenn der letzte Admin deaktiviert werden soll?**
  - Error Message: "Es muss mindestens ein aktiver Admin existieren"

### User mit Zeiterfassungen löschen
- **Werden User physisch gelöscht oder nur deaktiviert?**
  - Nur deaktiviert (Soft Delete)
  - Alle Zeiterfassungen bleiben erhalten und sind dem User zugeordnet
  - Begründung: Compliance & Historie für Prüfstelle

### Urlaubskontingent nachträglich ändern
- **Was passiert mit bereits erfassten Urlaubstagen, wenn das Kontingent reduziert wird?**
  - System erlaubt die Änderung
  - Warnung: "Achtung: [Name] hat bereits 20 Urlaubstage erfasst, aber neues Kontingent ist nur 15 Tage"
  - Admin entscheidet, keine automatische Korrektur

### Passwort-Sicherheit
- **Welche Passwort-Anforderungen gibt es?**
  - Mindestens 8 Zeichen
  - Keine weiteren Complexity-Requirements (z.B. Sonderzeichen) für MVP
  - Passwort wird gehasht gespeichert

### Initial-Passwort
- **Wie erhält der Mitarbeiter sein Initial-Passwort?**
  - Admin übermittelt manuell (z.B. per Telefon, Brief)
  - Keine automatische E-Mail im MVP (kann später ergänzt werden)

## Technische Anforderungen

### Performance
- User-Liste lädt < 500ms (auch bei 100+ Usern)
- User-Operationen (Create/Update) < 300ms

### Security
- Nur Admin-Rolle hat Zugriff auf diese Funktionen
- Nicht-Admins werden zu 403-Error-Page weitergeleitet

### Datenbank
- User haben Status-Flag: aktiv/deaktiviert (Boolean)
- Soft Delete (keine physische Löschung)

## Abhängigkeiten
- **Benötigt:** PROJ-1 (User Authentication) - für Admin-Login und Rollen-Check

## Hinweise für Implementierung
- Passwort-Reset-Funktion ist nicht Teil dieses Features
- E-Mail-Versand (z.B. "Dein Account wurde erstellt") ist optional für MVP
- User-Import (CSV/Excel) kann später ergänzt werden

---

## Tech-Design (Solution Architect)

### Component-Struktur

```
Admin-Portal Seite (/admin/users)
├── Seiten-Header
│   ├── Titel "Mitarbeiter-Verwaltung"
│   └── "Neuer Mitarbeiter" Button (öffnet Create-Dialog)
│
├── Such- und Filter-Bereich
│   ├── Suchfeld (Name/E-Mail)
│   └── Filter-Dropdowns (Rolle, Status)
│
├── Mitarbeiter-Tabelle (Desktop) / Karten (Mobile)
│   ├── Tabellen-Header (Name, E-Mail, Rolle, Status, Urlaubskontingent, Aktionen)
│   └── Mitarbeiter-Zeilen
│       ├── User-Info (Avatar + Name + E-Mail)
│       ├── Rollen-Badge (Mitarbeiter/Admin)
│       ├── Status-Badge (Aktiv/Deaktiviert - farbcodiert)
│       ├── Urlaubskontingent (z.B. "30 Tage")
│       └── Aktionen-Buttons
│           ├── "Bearbeiten" Button
│           ├── "Deaktivieren/Aktivieren" Toggle
│           └── Mehr-Optionen (falls künftig erweitert)
│
├── Create-Dialog (Modal)
│   └── Formular
│       ├── Vorname + Nachname (2 Felder nebeneinander)
│       ├── E-Mail (mit Format-Validierung)
│       ├── Rolle (Dropdown: Mitarbeiter/Admin)
│       ├── Initial-Passwort (mit "Anzeigen"-Toggle)
│       ├── Urlaubskontingent (Zahleneingabe)
│       └── Buttons: "Abbrechen" + "Speichern"
│
├── Edit-Dialog (Modal)
│   └── Formular (identisch zu Create, aber vorausgefüllt)
│       ├── Alle Felder wie Create
│       ├── Passwort-Feld optional (Hinweis: "Leer lassen = keine Änderung")
│       └── Buttons: "Abbrechen" + "Speichern"
│
└── Bestätigungs-Dialog (für Deaktivierung)
    ├── Warnung "Möchtest du [Name] wirklich deaktivieren?"
    ├── Info "Login wird gesperrt, aber alle Daten bleiben erhalten"
    └── Buttons: "Abbrechen" + "Deaktivieren"

Leere-Zustand (wenn keine User existieren)
└── "Noch keine Mitarbeiter - Lege den ersten Mitarbeiter an!"
```

### Daten-Model

**Mitarbeiter-Account enthält:**
- Eindeutige ID (automatisch generiert)
- Vorname + Nachname
- E-Mail (muss eindeutig sein)
- Passwort (verschlüsselt gespeichert)
- Rolle: Mitarbeiter oder Admin
- Status: Aktiv oder Deaktiviert
- Urlaubskontingent (Anzahl Tage pro Jahr, z.B. 30)
- Erstellungszeitpunkt
- Letzte Änderung

**Gespeichert in:** Lokale PostgreSQL Datenbank (Tabelle: `users`)

**Wichtig:**
- Soft Delete: Deaktivierte User werden NICHT gelöscht, nur Status wird geändert
- Passwörter werden gehasht gespeichert (nie im Klartext)
- E-Mail ist eindeutig (keine Duplikate möglich - UNIQUE Constraint in DB)

### Tech-Entscheidungen

**Warum PostgreSQL als Datenbank?**
→ Zuverlässig, bewährt, läuft lokal ohne Cloud-Abhängigkeit
→ Perfekt für strukturierte Daten wie User-Accounts
→ Unterstützt Constraints (UNIQUE E-Mail) und Transaktionen

**Warum Dialoge/Modals statt separate Seiten?**
→ Schnellerer Workflow: Create/Edit ohne Seiten-Wechsel
→ Übersichtlicher: User-Liste bleibt sichtbar im Hintergrund
→ Moderne UX mit shadcn/ui Dialog Component

**Warum Tabelle (Desktop) + Karten (Mobile)?**
→ Viele Daten-Spalten brauchen Platz auf Desktop
→ Mobile: Karten sind besser lesbar als kleine Tabellen

**Warum Search + Filter kombiniert?**
→ Admin kann schnell nach Namen suchen ODER nach Status filtern
→ Beide Optionen zusammen ermöglichen präzise Suche

**Warum Soft Delete statt echtem Löschen?**
→ Compliance: Zeiterfassungen müssen User-Zuordnung behalten
→ Historie: Bei Prüfungen müssen alte Daten nachvollziehbar sein
→ Reversibel: User kann reaktiviert werden bei Fehler

### Dependencies

**Benötigte Packages:**
- `pg` oder `@vercel/postgres` - PostgreSQL Client für Datenbank-Kommunikation
- `bcryptjs` - Passwort-Hashing
- `zod` - Formular-Validierung
- `react-hook-form` - Formular-Handling
- `sonner` (bereits vorhanden) - Toast-Notifications

**Bereits vorhandene UI-Components (können wiederverwendet werden):**
- Button, Input, Label, Form - für Formulare
- Table - für Mitarbeiter-Liste
- Dialog - für Create/Edit Modals
- Alert Dialog - für Bestätigungs-Dialoge
- Badge - für Rollen/Status
- Avatar - für User-Avatare

### API Endpoints (Backend)

**Neue Endpoints die gebaut werden:**
- `GET /api/admin/users` - Liste aller Mitarbeiter (mit Search/Filter)
- `POST /api/admin/users` - Neuen Mitarbeiter anlegen
- `PATCH /api/admin/users/[id]` - Mitarbeiter bearbeiten
- `PATCH /api/admin/users/[id]/toggle-status` - Aktivieren/Deaktivieren

**Security:**
- Alle Endpoints prüfen: Ist User ein Admin?
- Nicht-Admins bekommen 403 Forbidden Error

### Initial Admin Setup

**Datenbank-Seed (bei Installation):**
- Initial Admin Account wird automatisch angelegt
- E-Mail: `admin@hofzeit.local` (oder via Umgebungsvariable konfigurierbar)
- Passwort: temporär, muss beim ersten Login geändert werden
- Rolle: Admin
- Status: Aktiv

### Validierungs-Regeln

**Vorname + Nachname:**
- Pflichtfeld
- Mindestens 2 Zeichen

**E-Mail:**
- Pflichtfeld
- Muss gültiges E-Mail-Format haben
- Darf nicht bereits existieren

**Passwort:**
- Pflichtfeld (bei Create)
- Optional (bei Edit)
- Mindestens 8 Zeichen

**Urlaubskontingent:**
- Pflichtfeld
- Positive Zahl (z.B. 0-365)

**Deaktivierung:**
- User kann sich nicht selbst deaktivieren
- Es muss mindestens ein aktiver Admin existieren

---

## Implementierungsstatus

### ✅ Frontend Implementation (Abgeschlossen am 2026-02-12)

**Implementierte Components:**
- `/src/app/admin/users/page.tsx` - Haupt-Seite mit Such-/Filter-Funktionen
- `/src/components/admin/UsersTable.tsx` - User-Tabelle (Desktop + Mobile Cards)
- `/src/components/admin/CreateUserDialog.tsx` - Dialog zum Erstellen neuer User
- `/src/components/admin/EditUserDialog.tsx` - Dialog zum Bearbeiten von Usern
- `/src/components/admin/ConfirmDeactivateDialog.tsx` - Bestätigungs-Dialog für Deaktivierung

**Features:**
- ✅ Responsive Design (Desktop Tabelle / Mobile Cards)
- ✅ Such- und Filter-Funktionen (Name, E-Mail, Rolle, Status)
- ✅ Loading, Error und Empty States
- ✅ Form Validation (Client-side)
- ✅ Toast Notifications (Success/Error)
- ✅ HofZeit Brand Design (Blau & Grün)
- ✅ Accessibility (ARIA labels, Keyboard navigation)
- ✅ TypeScript Build erfolgreich

**Ausstehend:**
- ⏳ Backend API Endpoints müssen implementiert werden
- ⏳ Datenbank-Integration (Supabase PostgreSQL)
- ⏳ Admin-Rollen-Validierung (Middleware)
- ⏳ Initial Admin Seed Script

### ✅ Backend Implementation (Abgeschlossen am 2026-02-12)

**Implementierte API Endpoints:**
- ✅ `GET /api/admin/users` - Liste aller Mitarbeiter (mit Enum-Mapping)
- ✅ `POST /api/admin/users` - Neuen Mitarbeiter anlegen
- ✅ `PATCH /api/admin/users/[id]` - Mitarbeiter bearbeiten
- ✅ `PATCH /api/admin/users/[id]/toggle-status` - Aktivieren/Deaktivieren

**Implementierte Backend-Komponenten:**
- ✅ Database Migration: `drizzle/0001_add_user_fields.sql`
  - Neue Spalten: `first_name`, `last_name`, `vacation_days`, `updated_at`
  - Indexes für Performance: `idx_users_first_name`, `idx_users_last_name`
  - Auto-Update Trigger für `updated_at`
- ✅ Drizzle Schema Update: `src/db/schema.ts`
- ✅ Admin Helper Functions: `src/lib/admin.ts`
  - `requireAdmin()` - Admin-Authorization für API Routes
  - Enum-Mapping Functions (Frontend ↔ Database)
  - `transformUserToFrontend()` - User-Objekt Transformation
- ✅ Passwort-Hashing mit bcrypt (wiederverwendet aus PROJ-1)
- ✅ Zod Validation Schemas (Server-side)
- ✅ Edge Cases Handling:
  - ✅ Duplicate Email Protection
  - ✅ Self-Deactivation Prevention
  - ✅ Last Admin Protection
  - ✅ Deactivated User Login Prevention (bereits in PROJ-1)
- ✅ Seed Script: `scripts/seed-test-users.ts` (aktualisiert)

**Kritische Erkenntnisse:**
- ⚠️ **Enum Mapping erforderlich:** Frontend nutzt andere Enum-Werte als Database
  - Frontend: `'employee'`, `'active'` / Database: `'mitarbeiter'`, `'aktiv'`
  - Alle API Responses mappen Database → Frontend Format
- ✅ Next.js 15 Async Params: Route params müssen mit `await` entpackt werden
- ✅ TypeScript Build erfolgreich (keine Errors)
