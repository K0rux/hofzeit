# PROJ-5: Abwesenheitsverwaltung (Urlaub & Krankheit)

## Status: Deployed
**Created:** 2026-02-20
**Last Updated:** 2026-02-20

## Dependencies
- Requires: PROJ-1 (Benutzerauthentifizierung) – Nutzer muss eingeloggt sein
- Requires: PROJ-4 (Zeiterfassung) – Abwesenheiten erscheinen in Kalender/Monatsansicht neben Zeiteinträgen

## Beschreibung
Mitarbeiter können Abwesenheiten (Urlaub, Krankheit) für einzelne Tage oder Zeiträume eintragen. Abwesenheiten werden in der Tages- und Monatsansicht visuell hervorgehoben. Abwesenheiten können bearbeitet und gelöscht werden.

## User Stories
- Als Mitarbeiter möchte ich einen Urlaubstag oder Urlaubszeitraum eintragen (Startdatum, Enddatum, Typ: Urlaub), damit meine Abwesenheit dokumentiert ist.
- Als Mitarbeiter möchte ich einen Krankheitstag oder Krankheitszeitraum eintragen (Startdatum, Enddatum, Typ: Krankheit), damit meine Fehlzeit erfasst wird.
- Als Mitarbeiter möchte ich meine Abwesenheiten in einer Übersicht sehen (nach Datum sortiert), damit ich den Überblick behalte.
- Als Mitarbeiter möchte ich eine Abwesenheit bearbeiten (z. B. Enddatum verlängern), wenn sich der Zeitraum geändert hat.
- Als Mitarbeiter möchte ich eine Abwesenheit löschen, wenn sie falsch eingetragen wurde.
- Als Mitarbeiter möchte ich in der Monatsansicht sehen, an welchen Tagen ich Urlaub oder krank war, damit ich eine vollständige Übersicht habe.

## Acceptance Criteria
- [ ] Formular für neue Abwesenheit: Typ (Urlaub / Krankheit), Startdatum, Enddatum, optional Notiz
- [ ] Startdatum und Enddatum können gleich sein (einzelner Tag)
- [ ] Enddatum muss >= Startdatum sein (Validierung)
- [ ] Abwesenheiten werden in der Monatsübersicht farblich markiert (z. B. Urlaub = Grün, Krankheit = Orange/Rot)
- [ ] In der Tagesansicht wird eine Abwesenheit als Banner/Hinweis angezeigt (statt normalem Zeiteintrag-Formular)
- [ ] Übersichtsliste aller Abwesenheiten sortiert nach Startdatum (neueste zuerst)
- [ ] Jede Abwesenheit hat Bearbeiten- und Löschen-Schaltflächen
- [ ] Löschen erfordert Bestätigung
- [ ] Mitarbeiter sehen nur ihre eigenen Abwesenheiten
- [ ] Alle Formulare funktionieren auf Mobilgeräten (375px)
- [ ] Anzahl der Urlaubs- und Krankheitstage im aktuellen Jahr werden als Zusammenfassung angezeigt

## Edge Cases
- Was passiert, wenn an einem Abwesenheitstag auch ein Zeiteintrag vorhanden ist? → Beide können parallel existieren (kein automatisches Löschen), Nutzer ist verantwortlich
- Was passiert, wenn zwei Abwesenheiten sich überlappen? → In MVP keine automatische Überlappungsprüfung; Hinweis in UI empfohlen
- Was passiert bei einem Enddatum vor dem Startdatum? → Validierungsfehler
- Was passiert bei einer sehr langen Abwesenheit (> 30 Tage)? → Erlaubt, keine Begrenzung
- Was passiert, wenn kein Typ ausgewählt wird? → Pflichtfeld-Validierung

## Technical Requirements
- Sicherheit: API-seitige Überprüfung, dass Nutzer nur eigene Abwesenheiten lesen/schreiben kann
- Performance: Monatsabfrage inkl. Abwesenheiten < 300ms

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Kontext & Einordnung

Das Feature integriert sich in die bestehende App-Struktur: Die Zeiterfassung-Tagesansicht bekommt einen Abwesenheits-Banner, eine neue Abwesenheits-Seite listet alle Einträge, und die bestehende Tagesnavigation erhält farbliche Markierungen für Abwesenheitstage.

### Komponentenstruktur

```
App Layout (bestehend)
│
├── /zeiterfassung (bestehende Seite – erweitert)
│   ├── Tagesnavigation (bestehend – mit Farb-Dots für Abwesenheitstage)
│   ├── Abwesenheits-Banner  ← NEU
│   │   └── "Heute: Urlaub" / "Heute: Krank" (Hinweis statt Formular)
│   └── Zeiteintrag-Formular (bestehend, bleibt sichtbar – koexistiert)
│
└── /abwesenheiten  ← NEUE SEITE
    ├── Jahres-Zusammenfassung (Card)
    │   ├── Urlaubstage gesamt (aktuelles Jahr)
    │   └── Krankheitstage gesamt (aktuelles Jahr)
    ├── Neue Abwesenheit Button → Dialog
    │   └── Abwesenheits-Dialog (NEU)
    │       ├── Typ-Auswahl: Urlaub / Krankheit (RadioGroup)
    │       ├── Startdatum (Input type=date)
    │       ├── Enddatum (Input type=date)
    │       └── Notiz (optional, Textarea)
    ├── Abwesenheits-Liste (sortiert nach Startdatum, neueste zuerst)
    │   └── Abwesenheits-Karte (je Eintrag)
    │       ├── Typ-Badge (Urlaub grün / Krank orange)
    │       ├── Zeitraum + Anzahl Tage
    │       ├── Notiz (falls vorhanden)
    │       ├── Bearbeiten-Button → Dialog (vorausgefüllt)
    │       └── Löschen-Button → Bestätigungs-Dialog
    └── Leerzustand ("Noch keine Abwesenheiten eingetragen")
```

### Datenmodell

**Tabelle: `abwesenheiten`** (Supabase/PostgreSQL)

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | UUID | Eindeutige ID, automatisch generiert |
| `user_id` | UUID | Verknüpfung zum eingeloggten Mitarbeiter (Foreign Key → auth.users) |
| `typ` | Text | „urlaub" oder „krankheit" |
| `startdatum` | Datum | Erster Tag der Abwesenheit |
| `enddatum` | Datum | Letzter Tag (kann gleich Startdatum sein) |
| `notiz` | Text | Optional, frei formulierbar |
| `created_at` | Zeitstempel | Automatisch beim Erstellen gesetzt |

Row Level Security: Jeder Mitarbeiter sieht und bearbeitet nur seine eigenen Einträge.

### API-Endpunkte

| Route | Methode | Aktion |
|---|---|---|
| `/api/abwesenheiten` | GET | Alle Abwesenheiten des eingeloggten Nutzers (mit optionalem Monatsfilter) |
| `/api/abwesenheiten` | POST | Neue Abwesenheit anlegen |
| `/api/abwesenheiten/[id]` | PUT | Bestehende Abwesenheit bearbeiten |
| `/api/abwesenheiten/[id]` | DELETE | Abwesenheit löschen |

### Tech-Entscheidungen

| Entscheidung | Gewählt | Begründung |
|---|---|---|
| Datenspeicherung | Supabase (Datenbank) | Geräteübergreifend, konsistent mit bestehender Architektur |
| Monatsansicht-Integration | Farb-Dots in Tagesnavigation | Erweiterung der bestehenden Komponente, kein neuer Kalender nötig |
| Datumsauswahl | Native HTML date Input | Zuverlässig auf iPhone/Safari, kein zusätzliches Paket |
| Validierung | Zod + react-hook-form | Bereits im Projekt vorhanden |
| Abwesenheitstag-Erkennung | API-seitig | Zuverlässiger als client-seitige Datumsberechnung |

### Neue Pakete

Keine — alle benötigten shadcn/ui-Komponenten (Dialog, RadioGroup, Input, Textarea, Badge) sind bereits installiert.

## QA Test Results

**Tested:** 2026-02-21
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### AC-1: Formular für neue Abwesenheit (Typ, Startdatum, Enddatum, Notiz)
- [x] RadioGroup for Typ (Urlaub / Krankheit) present
- [x] Startdatum input (type=date) present
- [x] Enddatum input (type=date) present
- [x] Notiz textarea (optional, max 500 chars) present
- [x] Speichern + Abbrechen buttons present

#### AC-2: Startdatum und Enddatum können gleich sein (einzelner Tag)
- [x] No minimum gap enforced in client validation
- [x] No minimum gap enforced in API validation
- [x] DB constraint only checks `enddatum >= startdatum`
- [x] `berechneAnzahlTage()` correctly returns 1 for same dates

#### AC-3: Enddatum muss >= Startdatum sein (Validierung)
- [x] Client-side: `validate()` checks `enddatum < startdatum`
- [x] Server-side: POST and PUT routes check `enddatum < startdatum`
- [x] Database: CHECK constraint `enddatum >= startdatum`
- [x] UX: Enddatum auto-updates when Startdatum changes (if enddatum < new startdatum)
- [x] UX: Enddatum input has `min={startdatum}` attribute

#### AC-4: Abwesenheiten in Monatsübersicht farblich markiert
- [ ] BUG: No monthly calendar view with color-coded absence days exists. The tech design specified "Farb-Dots in Tagesnavigation" but the Tagesnavigation component was not modified. Only the AbwesenheitBanner on the day view addresses this partially.

#### AC-5: Tagesansicht zeigt Abwesenheit als Banner/Hinweis
- [x] AbwesenheitBanner component renders for absence days
- [x] Urlaub shows green styling (emerald), Krankheit shows orange
- [x] Banner displays typ label and optional notiz
- [x] Time entry form remains visible (coexistence as designed)

#### AC-6: Übersichtsliste sortiert nach Startdatum (neueste zuerst)
- [x] API query uses `.order('startdatum', { ascending: false })`
- [x] Limit of 500 applied to prevent excessive data load

#### AC-7: Bearbeiten- und Löschen-Schaltflächen
- [x] "Bearbeiten" button on each card opens pre-filled form dialog
- [x] "Löschen" button on each card opens confirmation dialog
- [x] Buttons have 44px min touch targets for mobile accessibility

#### AC-8: Löschen erfordert Bestätigung
- [x] Confirmation dialog with clear warning text
- [x] "Abbrechen" and "Löschen" (destructive variant) buttons
- [x] Loading state shown during deletion ("Wird gelöscht...")
- [x] Toast notification on successful deletion

#### AC-9: Mitarbeiter sehen nur eigene Abwesenheiten
- [x] API routes filter by `user_id = user.id`
- [x] RLS policies enforce `auth.uid() = user_id` for all CRUD operations
- [x] PUT/DELETE routes include `.eq('user_id', user.id)` as additional safeguard

#### AC-10: Formulare funktionieren auf Mobilgeräten (375px)
- [x] Dialog has `max-h-[90dvh] overflow-y-auto` for small screens
- [x] FAB: circular on mobile (`rounded-full h-14 w-14`), expanded on desktop
- [x] Navigation link uses "Abwes." abbreviation on mobile (`sm:hidden`)
- [x] Grid summary cards use `grid-cols-2` (responsive)
- [x] Touch targets >= 44px on all interactive elements

#### AC-11: Jahres-Zusammenfassung (Urlaubs- und Krankheitstage)
- [x] Summary cards shown for Urlaubstage and Krankheitstage
- [x] Filtered by current year
- [x] Day count uses `berechneAnzahlTage()` (inclusive of start and end)
- [x] Color-coded: emerald for Urlaub, orange for Krankheit

### Edge Cases Status

#### EC-1: Abwesenheit und Zeiteintrag am gleichen Tag
- [x] Both coexist: AbwesenheitBanner shown alongside time entries
- [x] No automatic deletion of time entries when absence exists

#### EC-2: Überlappende Abwesenheiten
- [x] No overlap check enforced (as per spec: MVP allows it)
- [ ] BUG (Low): No UI hint/warning about overlapping absences as recommended in spec ("Hinweis in UI empfohlen")

#### EC-3: Enddatum vor Startdatum
- [x] Client-side validation shows error message
- [x] Server-side returns 400 with clear error message
- [x] DB constraint prevents insertion

#### EC-4: Sehr lange Abwesenheit (> 30 Tage)
- [x] No maximum limit enforced (as designed)

#### EC-5: Kein Typ ausgewählt
- [x] RadioGroup defaults to "urlaub" — always has a value selected
- [x] Server-side Zod validation rejects invalid typ values

#### EC-6: Leerzustand (keine Abwesenheiten)
- [x] Empty state message "Noch keine Abwesenheiten eingetragen."
- [x] "Erste Abwesenheit eintragen" button shown in empty state

### Security Audit Results

- [x] **Authentication:** All API routes check `supabase.auth.getUser()` and return 401 if not authenticated
- [x] **Authorization:** RLS policies enforce user_id ownership on all CRUD operations; API routes double-check with `.eq('user_id', user.id)`
- [x] **Input validation (server):** Zod schemas validate all inputs; typ restricted to enum, dates regex-validated, notiz max 500 chars
- [x] **Input validation (DB):** CHECK constraints on typ, notiz length, and date ordering
- [x] **UUID validation:** PUT/DELETE routes validate ID format with regex before querying
- [x] **Rate limiting:** Write operations (POST, PUT, DELETE) rate-limited to 30 requests/minute per user
- [x] **SQL injection:** Supabase client uses parameterized queries
- [x] **XSS:** React auto-escapes output; no `dangerouslySetInnerHTML` usage
- [x] **IDOR prevention:** Cannot access/modify other users' absences (RLS + API-level checks)
- [x] **Foreign key:** ON DELETE CASCADE ensures cleanup when user is deleted
- [x] **No secrets exposed:** No hardcoded credentials in source code
- [ ] **Advisory:** Supabase leaked password protection is disabled (WARN level, not specific to this feature)

### Regression Test Results

- [x] Build succeeds without errors
- [x] ESLint passes with no warnings
- [x] Navigation: "Abwesenheiten" link added to AppLayout, all existing links intact
- [x] Zeiterfassung page: AbwesenheitBanner integrated without breaking existing functionality
- [x] API routes: `/api/abwesenheiten` and `/api/abwesenheiten/[id]` follow same patterns as existing routes

### Bugs Found

#### BUG-1: Monatsübersicht-Markierung fehlt
- **Severity:** Medium
- **AC Reference:** AC-4
- **Steps to Reproduce:**
  1. Go to /zeiterfassung
  2. Navigate between days using the Tagesnavigation
  3. Expected: Days with absences should be visually marked (e.g., color dots)
  4. Actual: No visual indication in the day navigation — user must navigate to each day individually to see AbwesenheitBanner
- **Impact:** Users cannot quickly see which days have absences without clicking through each day
- **Priority:** Fix before deployment

#### BUG-2: Überlappungs-Hinweis fehlt
- **Severity:** Low
- **AC Reference:** EC-2
- **Steps to Reproduce:**
  1. Create an absence for Feb 20–25
  2. Create another absence overlapping Feb 23–28
  3. Expected: A hint/warning about the overlap (as recommended in spec)
  4. Actual: Both entries saved silently with no overlap warning
- **Priority:** Nice to have (spec says "empfohlen", not required)

### Summary
- **Acceptance Criteria:** 10/11 passed (AC-4 failed)
- **Edge Cases:** 5/6 passed (EC-2 low-priority recommendation not implemented)
- **Bugs Found:** 2 total (0 critical, 0 high, 1 medium, 1 low)
- **Security:** Pass (all checks passed; 1 project-level advisory about leaked password protection)
- **Production Ready:** NO
- **Recommendation:** Fix BUG-1 (Monatsübersicht-Markierung) before deployment. BUG-2 is optional.

## Deployment

- **Production URL:** https://hofzeit.vercel.app/abwesenheiten
- **Deployed:** 2026-02-22
- **Git Tag:** v1.5.0-PROJ-5
