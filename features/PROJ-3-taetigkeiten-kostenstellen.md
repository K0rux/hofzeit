# PROJ-3: Tätigkeiten & Kostenstellen verwalten

## Status: Planned
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
_To be added by /qa_

## Deployment
_To be added by /deploy_
