# PROJ-3: Tätigkeiten & Kostenstellen verwalten

## Status: Deployed
**Created:** 2026-02-20
**Last Updated:** 2026-02-20

## Dependencies
- Requires: PROJ-1 (Benutzerauthentifizierung) – Nutzer muss eingeloggt sein

## Beschreibung
Jeder Mitarbeiter kann seine eigenen Tätigkeiten (z. B. „Rasenmähen", „Winterdienst") und Kostenstellen (z. B. „Spielplatz Nord", „Hauptstraße") anlegen, bearbeiten und löschen. Diese werden später bei der Zeiterfassung als Auswahl angeboten. Tätigkeiten und Kostenstellen sind benutzerspezifisch (jeder Mitarbeiter pflegt seine eigenen Listen).

## User Stories
- Als Mitarbeiter möchte ich neue Tätigkeiten anlegen (Name, optional Beschreibung), damit ich sie bei der Zeiterfassung auswählen kann.
- Als Mitarbeiter möchte ich meine vorhandenen Tätigkeiten bearbeiten (umbenennen, Beschreibung ändern), damit die Liste aktuell bleibt.
- Als Mitarbeiter möchte ich Tätigkeiten löschen, die ich nicht mehr benötige, damit meine Auswahlliste übersichtlich bleibt.
- Als Mitarbeiter möchte ich neue Kostenstellen anlegen (Name, optional Nummer/Code), damit ich Kosten korrekt zuordnen kann.
- Als Mitarbeiter möchte ich meine vorhandenen Kostenstellen bearbeiten, damit die Liste aktuell bleibt.
- Als Mitarbeiter möchte ich Kostenstellen löschen, die nicht mehr verwendet werden.
- Als Mitarbeiter möchte ich meine Tätigkeiten und Kostenstellen in einer übersichtlichen Liste sehen.

## Acceptance Criteria
- [ ] Getrennte Verwaltungsseiten für Tätigkeiten und Kostenstellen (oder getrennte Tabs)
- [ ] Formular zum Anlegen einer Tätigkeit: Name (Pflicht, max. 100 Zeichen), Beschreibung (optional, max. 255 Zeichen)
- [ ] Formular zum Anlegen einer Kostenstelle: Name (Pflicht, max. 100 Zeichen), Nummer/Code (optional, max. 50 Zeichen)
- [ ] Listen-Ansicht mit allen eigenen Tätigkeiten (sortiert alphabetisch)
- [ ] Listen-Ansicht mit allen eigenen Kostenstellen (sortiert alphabetisch)
- [ ] Jeder Eintrag hat Bearbeiten- und Löschen-Buttons
- [ ] Löschen erfordert Bestätigung (Dialog „Wirklich löschen?")
- [ ] Duplikate (gleicher Name) innerhalb des Nutzers werden verhindert (Fehlermeldung)
- [ ] Mitarbeiter sehen nur ihre eigenen Tätigkeiten und Kostenstellen
- [ ] Alle Formulare funktionieren auf Mobilgeräten (375px)

## Edge Cases
- Was passiert, wenn eine Tätigkeit gelöscht wird, die in bestehenden Zeiteinträgen verwendet wurde? → Tätigkeit bleibt in alten Einträgen erhalten (historische Daten), wird aber aus der Auswahlliste entfernt
- Was passiert, wenn eine Kostenstelle gelöscht wird, die in bestehenden Zeiteinträgen verwendet wurde? → Gleiche Logik wie bei Tätigkeiten (historisch erhalten)
- Was passiert bei leerem Namen? → Pflichtfeld-Validierung, Speichern nicht möglich
- Was passiert bei sehr langen Namen? → Zeichenlimit erzwingen mit Hinweis
- Was passiert, wenn ein Mitarbeiter keine Tätigkeiten hat? → Leerer Zustand mit Hinweis „Noch keine Tätigkeiten angelegt" und Direkt-Button zum Anlegen

## Technical Requirements
- Sicherheit: API-seitige Überprüfung, dass Nutzer nur eigene Einträge lesen/schreiben kann
- Performance: Listenabfrage < 200ms
- Mobil: Touch-freundliche Buttons (min. 44px Höhe)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Neue Seite
- URL: `/stammdaten` – sichtbar für alle eingeloggten Nutzer
- Neuer Navigationspunkt "Stammdaten" in `app-layout.tsx`

### Komponentenstruktur
```
/stammdaten
+-- Seitenheader ("Stammdaten")
+-- Tabs: "Tätigkeiten" | "Kostenstellen"
    |
    +-- Tab "Tätigkeiten"
    |   +-- "Neue Tätigkeit"-Button (oben rechts)
    |   +-- Tätigkeiten-Liste (alphabetisch)
    |   |   +-- Tätigkeit-Zeile (Name, Beschreibung, Edit-Icon, Delete-Icon)
    |   +-- Leerer Zustand (Hinweistext + Direkt-Button)
    |
    +-- Tab "Kostenstellen"
    |   +-- "Neue Kostenstelle"-Button (oben rechts)
    |   +-- Kostenstellen-Liste (alphabetisch)
    |   |   +-- Kostenstelle-Zeile (Name, Nummer/Code, Edit-Icon, Delete-Icon)
    |   +-- Leerer Zustand (Hinweistext + Direkt-Button)
    |
    +-- Formular-Dialog (Anlegen / Bearbeiten)
    |   +-- Name (Pflicht, max. 100 Zeichen)
    |   +-- Beschreibung/Nummer (optional)
    |   +-- Fehleranzeige (Duplikat, Pflichtfeld)
    |   +-- Abbrechen | Speichern
    |
    +-- Löschen-Bestätigungs-Dialog
        +-- Warnhinweis
        +-- Abbrechen | Löschen
```

### Datenmodell (Supabase)

**Tabelle `taetigkeiten`:**
- id (UUID, PK)
- user_id (FK → auth.users, NOT NULL)
- name (TEXT, max. 100 Zeichen, Pflicht)
- beschreibung (TEXT, max. 255 Zeichen, optional)
- created_at, updated_at (Timestamps)
- Unique Constraint: (user_id, name)
- RLS: Nutzer liest/schreibt nur eigene Zeilen

**Tabelle `kostenstellen`:**
- id (UUID, PK)
- user_id (FK → auth.users, NOT NULL)
- name (TEXT, max. 100 Zeichen, Pflicht)
- nummer (TEXT, max. 50 Zeichen, optional)
- created_at, updated_at (Timestamps)
- Unique Constraint: (user_id, name)
- RLS: Nutzer liest/schreibt nur eigene Zeilen

### API-Endpunkte
```
GET    /api/taetigkeiten          → Liste (alphabetisch, nur eigene)
POST   /api/taetigkeiten          → Neue Tätigkeit
PATCH  /api/taetigkeiten/[id]     → Tätigkeit bearbeiten
DELETE /api/taetigkeiten/[id]     → Tätigkeit löschen

GET    /api/kostenstellen          → Liste (alphabetisch, nur eigene)
POST   /api/kostenstellen          → Neue Kostenstelle
PATCH  /api/kostenstellen/[id]     → Kostenstelle bearbeiten
DELETE /api/kostenstellen/[id]     → Kostenstelle löschen
```

### Tech-Entscheidungen
- **Supabase DB**: Daten müssen geräteübergreifend verfügbar sein und werden von PROJ-4 (Zeiterfassung) als Auswahllisten genutzt
- **RLS**: Datenbankebene erzwingt Datenisolierung pro Nutzer
- **Tabs (shadcn)**: Platzsparend auf Mobile, beide Listen auf einer Seite
- **Dialog (shadcn)**: Kein Seitenwechsel, direkte Inline-Interaktion
- **React useState**: Einfache Seite, kein globaler State nötig
- **Zod + react-hook-form**: Validierung client- und serverseitig konsistent

### Bereits installierte shadcn/ui-Komponenten
`Tabs`, `Dialog`, `Form`, `Input`, `Textarea`, `Button`, `Table`, `Alert`, `Badge`

### Edge Case: Gelöschte Einträge in PROJ-4
- FK in der Zeiterfassungs-Tabelle wird NULLABLE angelegt
- Bestehende Zeiteinträge behalten historischen Bezug (NULL oder Name-Snapshot)
- Finale Entscheidung bei PROJ-4

## QA Test Results

**Tested:** 2026-02-21
**App URL:** http://localhost:3000/stammdaten
**Tester:** QA Engineer (AI)

### Build & Lint Status
- [x] `npm run build` passes with no errors
- [x] `npm run lint` passes with no warnings
- [x] All routes registered correctly (`/stammdaten`, `/api/taetigkeiten`, `/api/kostenstellen`)

### Acceptance Criteria Status

#### AC-1: Getrennte Tabs für Tätigkeiten und Kostenstellen
- [x] Tabs-Komponente (shadcn) mit "Tätigkeiten" und "Kostenstellen" auf `/stammdaten`
- [x] Tab-Wechsel funktioniert korrekt

#### AC-2: Formular Tätigkeit (Name Pflicht max. 100, Beschreibung optional max. 255)
- [x] Name-Feld mit `maxLength={100}` und Pflichtfeld-Validierung (client + server)
- [x] Beschreibung als Textarea mit `maxLength={255}`
- [x] Zod-Schema validiert serverseitig: `.min(1)`, `.max(100)`, `.max(255)`
- [x] DB CHECK Constraints: `char_length(name) <= 100`, `char_length(beschreibung) <= 255`

#### AC-3: Formular Kostenstelle (Name Pflicht max. 100, Nummer optional max. 50)
- [x] Name-Feld mit `maxLength={100}` und Pflichtfeld-Validierung (client + server)
- [x] Nummer-Feld mit `maxLength={50}`
- [x] Zod-Schema validiert serverseitig
- [x] DB CHECK Constraints vorhanden

#### AC-4: Listen-Ansicht Tätigkeiten (alphabetisch sortiert)
- [x] Tabelle mit Name, Beschreibung (hidden on mobile), Aktionen
- [x] API sortiert alphabetisch: `.order('name', { ascending: true })`
- [x] Loading-Skeleton-State vorhanden

#### AC-5: Listen-Ansicht Kostenstellen (alphabetisch sortiert)
- [x] Tabelle mit Name, Nummer/Code (hidden on mobile), Aktionen
- [x] API sortiert alphabetisch
- [x] Loading-Skeleton-State vorhanden

#### AC-6: Bearbeiten- und Löschen-Buttons pro Eintrag
- [x] Jede Tabellenzeile hat "Bearbeiten" und "Löschen" Buttons
- [x] Bearbeiten öffnet vorausgefülltes Formular-Dialog
- [x] Löschen öffnet Bestätigungs-Dialog

#### AC-7: Löschen erfordert Bestätigung
- [x] LoeschenDialog zeigt Item-Namen an
- [x] Text: "Möchten Sie die [Typ] '[Name]' wirklich löschen?"
- [x] Abbrechen- und Löschen-Buttons vorhanden
- [x] Löschen-Button ist `variant="destructive"`

#### AC-8: Duplikate werden verhindert
- [x] DB UNIQUE Constraint: `(user_id, name)` auf beiden Tabellen
- [x] API erkennt Postgres-Fehler `23505` und gibt benutzerfreundliche Meldung zurück
- [x] Fehlermeldung wird im Dialog angezeigt

#### AC-9: Nutzer sehen nur eigene Einträge
- [x] API filtert mit `.eq('user_id', user.id)` bei allen CRUD-Operationen
- [x] RLS-Policies auf DB-Ebene: `auth.uid() = user_id` für SELECT, INSERT, UPDATE, DELETE
- [x] Doppelte Absicherung (API + RLS)

#### AC-10: Formulare funktionieren auf Mobilgeräten (375px)
- [x] Dialog mit `sm:max-w-md` (responsive)
- [x] Beschreibung/Nummer-Spalte auf Mobile ausgeblendet (`hidden sm:table-cell`)
- [x] Aktions-Buttons: `min-h-[44px]` hinzugefügt → Touch-Mindestgröße erfüllt (FIXED)

### Edge Cases Status

#### EC-1: Gelöschte Tätigkeit/Kostenstelle in Zeiteinträgen
- [x] Design-Entscheidung dokumentiert: FK wird in PROJ-4 NULLABLE angelegt
- [x] Kein FK zu Zeiterfassungs-Tabelle vorhanden (PROJ-4 noch nicht implementiert)

#### EC-2: Leerer Name
- [x] Client-Validierung: `if (!name.trim())` → Fehlermeldung
- [x] Server-Validierung: Zod `.min(1)` → 400-Fehler
- [x] DB: NOT NULL Constraint auf `name`

#### EC-3: Sehr langer Name
- [x] HTML `maxLength={100}` verhindert Eingabe über 100 Zeichen
- [x] Server-Validierung: Zod `.max(100)`
- [x] DB CHECK: `char_length(name) <= 100`

#### EC-4: Keine Einträge vorhanden (Leerer Zustand)
- [x] Tätigkeiten: "Noch keine Tätigkeiten angelegt." + "Erste Tätigkeit anlegen" Button
- [x] Kostenstellen: "Noch keine Kostenstellen angelegt." + "Erste Kostenstelle anlegen" Button

### Security Audit Results

- [x] **Authentication**: Middleware schützt alle Routen – unauthentifizierte Requests werden zu `/login` weitergeleitet
- [x] **Authentication (API)**: Alle API-Routes prüfen `supabase.auth.getUser()` und returnen 401 bei fehlender Authentifizierung
- [x] **Authorization (IDOR)**: Alle Queries filtern auf `user_id = user.id` – kein Zugriff auf fremde Daten möglich
- [x] **RLS-Policies**: SELECT, INSERT, UPDATE, DELETE Policies auf beiden Tabellen mit `auth.uid() = user_id`
- [x] **Input Validation**: Dreifache Validierung (Client → Zod API → DB Constraints)
- [x] **UUID-Validierung**: `[id]`-Routes validieren UUID-Format vor DB-Zugriff
- [x] **SQL Injection**: Supabase Client verwendet parametrisierte Queries
- [x] **XSS**: React escaped automatisch alle Ausgaben, kein `dangerouslySetInnerHTML`
- [x] **CSRF**: Supabase Auth verwendet httpOnly Cookies
- [x] **updated_at Trigger**: DB-Trigger `update_updated_at_column()` auf beiden Tabellen
- [x] **Cascading Delete**: FK zu `auth.users` mit `ON DELETE CASCADE`
- [x] **Query Limit**: `.limit(500)` auf allen Listen-Abfragen
- [x] **Double-Submit Prevention**: Submit-Button wird während `submitting` state disabled
- [ ] **Info (nicht-kritisch)**: Supabase Advisor empfiehlt "Leaked Password Protection" zu aktivieren (betrifft Auth generell, nicht PROJ-3 spezifisch)

### Regression Test (PROJ-1 & PROJ-2)

- [x] Navigation-Links: Dashboard, Stammdaten, Verwaltung (Admin) korrekt in `app-layout.tsx`
- [x] Middleware schützt weiterhin alle Routes inkl. Admin-Prüfung
- [x] Keine Änderungen an bestehenden API-Routes oder Komponenten
- [x] Build kompiliert alle bestehenden Routes erfolgreich

### Bugs Found

#### BUG-1: Touch-Targets zu klein auf Mobile — FIXED
- **Severity:** Medium
- **Fix:** `min-h-[44px]` zu allen vier Aktions-Buttons (Bearbeiten/Löschen × 2 Tabs) hinzugefügt
- **Datei:** `src/app/stammdaten/page.tsx`

### Summary
- **Acceptance Criteria:** 10/10 passed
- **Edge Cases:** 4/4 passed
- **Bugs Found:** 1 total (0 critical, 0 high, 1 medium, 0 low) — alle behoben
- **Security:** Pass – keine Schwachstellen gefunden
- **Production Ready:** YES
- **Recommendation:** Bereit für `/deploy`

## Deployment

**Deployed:** 2026-02-21
**Production URL:** https://hofzeit.vercel.app/stammdaten
**Git Tag:** v1.3.0-PROJ-3
