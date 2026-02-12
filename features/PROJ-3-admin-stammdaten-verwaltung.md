# PROJ-3: Admin - Stammdaten-Verwaltung (Tätigkeiten & Kostenstellen)

## Status: 🟡 In Progress - Frontend Complete (Backend Pending)

## Überblick
Admin-Portal zur Verwaltung von Tätigkeiten und Kostenstellen. Diese Stammdaten werden von Mitarbeitern bei der Zeiterfassung per Dropdown ausgewählt.

## User Stories

- Als **Admin** möchte ich Tätigkeiten anlegen (z.B. "Straßenreinigung", "Grünpflege"), damit Mitarbeiter diese bei der Zeiterfassung auswählen können
- Als **Admin** möchte ich Kostenstellen anlegen (z.B. "Projekt A", "Abteilung Straßenbau"), damit Zeiterfassungen korrekt zugeordnet werden
- Als **Admin** möchte ich eine Übersicht aller Tätigkeiten und Kostenstellen sehen, um den Überblick zu behalten
- Als **Admin** möchte ich Tätigkeiten und Kostenstellen bearbeiten, um Tippfehler oder Änderungen zu korrigieren
- Als **Admin** möchte ich Tätigkeiten und Kostenstellen löschen, um ungenutzte Einträge zu entfernen
- Als **Mitarbeiter** möchte ich alle verfügbaren Tätigkeiten und Kostenstellen in Dropdowns sehen, um meine Auswahl zu treffen

## Acceptance Criteria

### Tätigkeiten-Verwaltung

#### Übersicht
- [ ] Tabelle/Liste aller Tätigkeiten
- [ ] Anzeige: Name, Beschreibung, Erstellt am, Anzahl Verwendungen
- [ ] Suchfunktion nach Name
- [ ] Sortierung nach Name, Erstellungsdatum, Verwendungen

#### Tätigkeit erstellen
- [ ] "Neue Tätigkeit" Button öffnet Formular
- [ ] Formular-Felder:
  - Name (Pflichtfeld, max. 100 Zeichen)
  - Beschreibung (Optional, max. 500 Zeichen)
- [ ] "Speichern" Button erstellt Tätigkeit
- [ ] Success Message: "Tätigkeit '[Name]' wurde erstellt"

#### Tätigkeit bearbeiten
- [ ] "Bearbeiten" Button bei jeder Tätigkeit
- [ ] Formular mit vorausgefüllten Daten
- [ ] Editierbare Felder: Name, Beschreibung
- [ ] "Speichern" Button aktualisiert Tätigkeit
- [ ] Success Message: "Änderungen gespeichert"

#### Tätigkeit löschen
- [ ] "Löschen" Button bei jeder Tätigkeit
- [ ] System prüft, ob Tätigkeit in Zeiterfassungen verwendet wird
- [ ] **Fall 1: Nicht verwendet (0 Zeiterfassungen)**
  - Bestätigungs-Dialog: "Möchtest du '[Name]' wirklich löschen?"
  - Nach Bestätigung: Tätigkeit wird permanent gelöscht
  - Success Message: "Tätigkeit '[Name]' wurde gelöscht"
- [ ] **Fall 2: In Verwendung (> 0 Zeiterfassungen)**
  - Warnung-Dialog: "Achtung: '[Name]' wird in [X] Zeiterfassungen verwendet. Wenn du diese Tätigkeit löschst, werden diese Zeiterfassungen auf 'Gelöschte Tätigkeit' gesetzt. Trotzdem löschen?"
  - Button: "Ja, trotzdem löschen" (rot/warning)
  - Nach Bestätigung: Tätigkeit wird gelöscht, Zeiterfassungen behalten Referenz auf gelöschte ID
  - Success Message: "Tätigkeit '[Name]' wurde gelöscht. [X] Zeiterfassungen wurden aktualisiert."

### Kostenstellen-Verwaltung

#### Übersicht
- [ ] Tabelle/Liste aller Kostenstellen
- [ ] Anzeige: Name, Nummer (optional), Beschreibung, Erstellt am, Anzahl Verwendungen
- [ ] Suchfunktion nach Name oder Nummer
- [ ] Sortierung nach Name, Nummer, Erstellungsdatum, Verwendungen

#### Kostenstelle erstellen
- [ ] "Neue Kostenstelle" Button öffnet Formular
- [ ] Formular-Felder:
  - Name (Pflichtfeld, max. 100 Zeichen)
  - Nummer (Optional, z.B. "KST-001", max. 20 Zeichen)
  - Beschreibung (Optional, max. 500 Zeichen)
- [ ] "Speichern" Button erstellt Kostenstelle
- [ ] Success Message: "Kostenstelle '[Name]' wurde erstellt"

#### Kostenstelle bearbeiten
- [ ] "Bearbeiten" Button bei jeder Kostenstelle
- [ ] Formular mit vorausgefüllten Daten
- [ ] Editierbare Felder: Name, Nummer, Beschreibung
- [ ] "Speichern" Button aktualisiert Kostenstelle
- [ ] Success Message: "Änderungen gespeichert"

#### Kostenstelle löschen
- [ ] "Löschen" Button bei jeder Kostenstelle
- [ ] System prüft, ob Kostenstelle in Zeiterfassungen verwendet wird
- [ ] **Fall 1: Nicht verwendet (0 Zeiterfassungen)**
  - Bestätigungs-Dialog: "Möchtest du '[Name]' wirklich löschen?"
  - Nach Bestätigung: Kostenstelle wird permanent gelöscht
  - Success Message: "Kostenstelle '[Name]' wurde gelöscht"
- [ ] **Fall 2: In Verwendung (> 0 Zeiterfassungen)**
  - Warnung-Dialog: "Achtung: '[Name]' wird in [X] Zeiterfassungen verwendet. Wenn du diese Kostenstelle löschst, werden diese Zeiterfassungen auf 'Gelöschte Kostenstelle' gesetzt. Trotzdem löschen?"
  - Button: "Ja, trotzdem löschen" (rot/warning)
  - Nach Bestätigung: Kostenstelle wird gelöscht, Zeiterfassungen behalten Referenz auf gelöschte ID
  - Success Message: "Kostenstelle '[Name]' wurde gelöscht. [X] Zeiterfassungen wurden aktualisiert."

### UX/UI (Frontend ✅)
- [x] Mobile-optimiert (responsive Tabellen/Cards)
- [x] Zwei separate Bereiche im Admin-Portal: "Tätigkeiten" und "Kostenstellen"
- [x] Loading-State bei Operationen
- [x] Moderne, übersichtliche UI mit smooth Animationen
- [x] Validierungs-Fehler werden inline im Formular angezeigt

## Edge Cases

### Doppelte Namen
- **Was passiert, wenn eine Tätigkeit/Kostenstelle mit gleichem Namen erstellt wird?**
  - Warnung: "Eine Tätigkeit mit diesem Namen existiert bereits. Trotzdem erstellen?"
  - Admin kann entscheiden (Duplikate sind erlaubt, aber nicht empfohlen)

### Verwendete Stammdaten löschen
- **Was passiert mit Zeiterfassungen, wenn eine verwendete Tätigkeit/Kostenstelle gelöscht wird?**
  - Zeiterfassungen behalten die ID der gelöschten Tätigkeit/Kostenstelle
  - Anzeige in Zeiterfassungs-Übersicht: "Gelöschte Tätigkeit" oder "Gelöschte Kostenstelle" (grau/ausgegraut)
  - Optional: Name wird in Zeiterfassungs-Tabelle zwischengespeichert (deleted_activity_name)
  - Begründung: Historie muss für Prüfstelle erhalten bleiben

- **Kann eine gelöschte Tätigkeit/Kostenstelle wiederhergestellt werden?**
  - Nein, Löschung ist permanent
  - Admin muss neue Tätigkeit/Kostenstelle mit gleichem Namen anlegen
  - Alte Zeiterfassungen behalten Referenz auf gelöschte ID

### Leere Liste
- **Was passiert, wenn keine Tätigkeiten/Kostenstellen angelegt sind?**
  - Mitarbeiter können keine Zeiterfassungen erstellen (Dropdown ist leer)
  - Error Message: "Keine Tätigkeiten verfügbar. Bitte kontaktiere den Administrator."
  - Empfehlung: Admin sollte Initial-Daten beim Setup anlegen

### Initial-Daten
- **Gibt es vordefinierte Tätigkeiten/Kostenstellen beim Setup?**
  - Ja, Beispiel-Daten beim ersten Start:
    - Tätigkeiten: "Büroarbeit", "Außendienst", "Fahrtätigkeit"
    - Kostenstellen: "Allgemein"
  - Admin kann diese anpassen oder löschen

### Sortierung in Dropdowns
- **In welcher Reihenfolge erscheinen Tätigkeiten/Kostenstellen in Mitarbeiter-Dropdowns?**
  - Alphabetisch sortiert (A-Z)
  - Alle nicht-gelöschten Einträge werden angezeigt

### Beschreibungsfeld
- **Wird die Beschreibung den Mitarbeitern angezeigt?**
  - Nein, nur für Admin-interne Notizen
  - Kann später als Tooltip ergänzt werden (optional)

## Technische Anforderungen

### Performance
- Listen laden < 500ms (auch bei 100+ Einträgen)
- Create/Update Operationen < 300ms

### Security
- Nur Admin-Rolle hat Zugriff auf diese Funktionen
- Mitarbeiter-Rolle: Read-only Zugriff (für Dropdowns)

### Datenbank
- Tätigkeiten und Kostenstellen werden physisch gelöscht (Hard Delete)
- Zeiterfassungen speichern deleted_activity_name und deleted_cost_center_name für gelöschte Referenzen
- Timestamps: created_at, updated_at
- Foreign Keys: ON DELETE SET NULL (Zeiterfassungen behalten NULL-Referenz)

## Abhängigkeiten
- **Benötigt:** PROJ-1 (User Authentication) - für Admin-Rollen-Check
- **Benötigt vor:** PROJ-4 (Zeiterfassung) - Stammdaten müssen vorhanden sein

## Hinweise für Implementierung
- Initial-Daten (Seed Data) sollten beim ersten Setup automatisch angelegt werden
- Stammdaten-Import (CSV/Excel) kann später ergänzt werden
- Hierarchische Kostenstellen (z.B. Hauptkostenstelle → Unterkostenstelle) sind nicht Teil des MVP

---

## Tech-Design (Solution Architect)

### Component-Struktur

```
Admin-Portal Seite (/admin)
├── Dashboard-Cards
│   ├── [Bereits vorhanden] Benutzerverwaltung-Card
│   ├── [NEU] Tätigkeiten-Card → Link zu /admin/activities
│   └── [NEU] Kostenstellen-Card → Link zu /admin/cost-centers

---

Tätigkeiten-Verwaltungsseite (/admin/activities)
├── Seiten-Header
│   ├── Zurück-Button (→ /admin)
│   ├── Titel "Tätigkeiten-Verwaltung"
│   └── "Neue Tätigkeit" Button (öffnet Create-Dialog)
│
├── Such- und Sortier-Bereich
│   ├── Suchfeld (nach Name filtern)
│   └── Sortier-Dropdown (Name, Erstellungsdatum, Verwendungen)
│
├── Tätigkeiten-Tabelle (Desktop) / Karten (Mobile)
│   ├── Spalten: Name, Beschreibung, Erstellt am, Verwendungen, Aktionen
│   └── Tätigkeiten-Zeilen
│       ├── Name (Haupttext)
│       ├── Beschreibung (Kleintext/Optional)
│       ├── Erstellungsdatum (z.B. "12. Feb 2026")
│       ├── Verwendungen-Badge (z.B. "12 Zeiterfassungen")
│       └── Aktionen
│           ├── "Bearbeiten" Button
│           └── "Löschen" Button
│
├── Create-Dialog (Modal)
│   └── Formular
│       ├── Name (Pflichtfeld, max. 100 Zeichen)
│       ├── Beschreibung (Optional, max. 500 Zeichen, Textfeld)
│       └── Buttons: "Abbrechen" + "Speichern"
│
├── Edit-Dialog (Modal)
│   └── Formular (identisch zu Create, aber vorausgefüllt)
│
├── Delete-Dialog (Smart-Variante!)
│   └── **Fall 1: Nicht verwendet (0 Zeiterfassungen)**
│       ├── Titel "Tätigkeit löschen?"
│       ├── Text "Möchtest du '[Name]' wirklich löschen?"
│       └── Buttons: "Abbrechen" + "Löschen"
│   └── **Fall 2: In Verwendung (> 0 Zeiterfassungen)**
│       ├── Titel "Achtung: Tätigkeit wird verwendet!"
│       ├── Warning-Text "[Name] wird in [X] Zeiterfassungen verwendet."
│       ├── Erklärung "Diese Zeiterfassungen werden auf 'Gelöschte Tätigkeit' gesetzt."
│       └── Buttons: "Abbrechen" + "Trotzdem löschen" (rot)
│
└── Leere-Zustand
    └── "Noch keine Tätigkeiten - Lege die erste Tätigkeit an!"

---

Kostenstellen-Verwaltungsseite (/admin/cost-centers)
├── [Identische Struktur wie Tätigkeiten]
├── Zusätzliches Feld: "Nummer" (optional, z.B. "KST-001")
└── Sonst gleiche Logik wie Tätigkeiten-Seite
```

### Daten-Model

#### Tätigkeit (Activity)
Jede Tätigkeit hat:
- Eindeutige ID (automatisch generiert)
- Name (z.B. "Straßenreinigung", max. 100 Zeichen)
- Beschreibung (Optional, z.B. "Reinigung städtischer Straßen", max. 500 Zeichen)
- Erstellungszeitpunkt
- Letztes Update
- Anzahl Verwendungen (wird berechnet: wie viele Zeiterfassungen nutzen diese Tätigkeit?)

**Gespeichert in:** PostgreSQL Datenbank (neue Tabelle: `activities`)

#### Kostenstelle (Cost Center)
Jede Kostenstelle hat:
- Eindeutige ID (automatisch generiert)
- Name (z.B. "Projekt A", max. 100 Zeichen)
- Nummer (Optional, z.B. "KST-001", max. 20 Zeichen)
- Beschreibung (Optional, max. 500 Zeichen)
- Erstellungszeitpunkt
- Letztes Update
- Anzahl Verwendungen (wird berechnet: wie viele Zeiterfassungen nutzen diese Kostenstelle?)

**Gespeichert in:** PostgreSQL Datenbank (neue Tabelle: `cost_centers`)

#### Wichtig: Löschen von verwendeten Stammdaten
- Wenn eine Tätigkeit/Kostenstelle gelöscht wird, die in Zeiterfassungen verwendet wird:
  - Die Tätigkeit/Kostenstelle wird **permanent gelöscht** (Hard Delete)
  - Zeiterfassungen behalten die ID der gelöschten Tätigkeit/Kostenstelle (wird NULL)
  - **Name wird zwischengespeichert** in Zeiterfassung (Spalten: `deleted_activity_name`, `deleted_cost_center_name`)
  - Anzeige in Zeiterfassungs-Übersicht: "Gelöschte Tätigkeit" (ausgegraut)
- **Warum Hard Delete?** Stammdaten können ersetzt werden, Historie bleibt erhalten durch gespeicherten Namen

#### Initial-Daten (Seed Data)
Beim ersten Setup werden automatisch Beispiel-Daten angelegt:
- **Tätigkeiten:**
  - "Büroarbeit"
  - "Außendienst"
  - "Fahrtätigkeit"
- **Kostenstellen:**
  - "Allgemein" (Nummer: "KST-001")

### Tech-Entscheidungen

**Warum zwei separate Seiten (`/admin/activities` + `/admin/cost-centers`)?**
→ Klarere Trennung für Admins
→ Vermeidet überladene UI mit zwei Tabellen auf einer Seite
→ Einfachere Navigation und Übersichtlichkeit

**Warum Smart-Delete-Dialog (2 Varianten)?**
→ Admin bekommt klare Warnung bei verwendeten Stammdaten
→ Verhindert versehentliches Löschen wichtiger Daten
→ Zeigt direkt Auswirkungen (z.B. "12 Zeiterfassungen betroffen")

**Warum Hard Delete statt Soft Delete?**
→ Stammdaten sind ersetzbar (im Gegensatz zu User-Accounts)
→ Einfacheres Daten-Model (keine "deleted"-Flags nötig)
→ Historie bleibt erhalten durch zwischengespeicherten Namen in Zeiterfassungen
→ Admin kann neue Tätigkeit mit gleichem Namen anlegen

**Warum "Verwendungen"-Spalte?**
→ Admin sieht sofort, welche Stammdaten aktiv genutzt werden
→ Hilft bei Entscheidung: "Kann ich das löschen?"
→ Zeigt welche Stammdaten wichtig sind vs. ungenutzt

**Warum Beschreibungsfeld (nur für Admin sichtbar)?**
→ Admin kann interne Notizen hinterlegen
→ Wird **nicht** in Mitarbeiter-Dropdowns angezeigt (nur Name)
→ Kann später als Tooltip ergänzt werden (optional)

**Warum Component-Wiederverwendung aus PROJ-2?**
→ Identisches Design-Pattern (Tabelle, Dialoge, Aktionen)
→ Schnellere Entwicklung durch Copy-Paste-Adapt
→ Konsistente UX im gesamten Admin-Portal

### Dependencies

**Benötigte Packages:**
- `zod` (bereits vorhanden) - Formular-Validierung
- `react-hook-form` (bereits vorhanden) - Formular-Handling
- `sonner` (bereits vorhanden) - Toast-Notifications

**Alle UI-Components bereits vorhanden (shadcn/ui):**
- Button, Input, Label, Form - für Formulare
- Table - für Listen
- Dialog - für Create/Edit Modals
- Alert Dialog - für Delete-Bestätigung
- Badge - für Verwendungen-Anzeige
- Textarea - für Beschreibungsfeld

**Keine neuen Dependencies nötig! 🎉**

### API Endpoints (Backend)

**Neue Endpoints die gebaut werden:**

**Tätigkeiten:**
- `GET /api/admin/activities` - Liste aller Tätigkeiten (mit Search + Usage Count)
- `POST /api/admin/activities` - Neue Tätigkeit anlegen
- `PATCH /api/admin/activities/[id]` - Tätigkeit bearbeiten
- `DELETE /api/admin/activities/[id]` - Tätigkeit löschen (prüft Usage)

**Kostenstellen:**
- `GET /api/admin/cost-centers` - Liste aller Kostenstellen (mit Search + Usage Count)
- `POST /api/admin/cost-centers` - Neue Kostenstelle anlegen
- `PATCH /api/admin/cost-centers/[id]` - Kostenstelle bearbeiten
- `DELETE /api/admin/cost-centers/[id]` - Kostenstelle löschen (prüft Usage)

**Mitarbeiter-Zugriff (für PROJ-4):**
- `GET /api/activities` - Liste aller Tätigkeiten (Public für Dropdowns, kein Admin-Check)
- `GET /api/cost-centers` - Liste aller Kostenstellen (Public für Dropdowns, kein Admin-Check)

**Security:**
- Admin-Endpoints nutzen `requireAdmin()` (bereits vorhanden aus PROJ-2)
- Nicht-Admins bekommen 403 Forbidden Error
- Public-Endpoints `/api/activities` und `/api/cost-centers` brauchen nur Login-Check (alle User dürfen lesen)

**Usage Count Berechnung:**
- Backend zählt bei GET-Request: "Wie viele Zeiterfassungen nutzen diese ID?"
- Wird bei jedem Laden neu berechnet (keine separate Spalte in DB)
- Beispiel-Query: `SELECT COUNT(*) FROM time_entries WHERE activity_id = ?`

### Datenbank-Schema (Neue Tabellen)

**Tabelle: `activities`**
- `id` (UUID, Primary Key)
- `name` (Text, max. 100 Zeichen, NOT NULL)
- `description` (Text, max. 500 Zeichen, Optional)
- `created_at` (Timestamp, automatisch)
- `updated_at` (Timestamp, automatisch)

**Tabelle: `cost_centers`**
- `id` (UUID, Primary Key)
- `name` (Text, max. 100 Zeichen, NOT NULL)
- `number` (Text, max. 20 Zeichen, Optional)
- `description` (Text, max. 500 Zeichen, Optional)
- `created_at` (Timestamp, automatisch)
- `updated_at` (Timestamp, automatisch)

**Wichtig für PROJ-4 (Zeiterfassung):**
- Zeiterfassungs-Tabelle `time_entries` (wird später gebaut) muss diese Spalten haben:
  - `activity_id` (UUID, Foreign Key zu `activities`, ON DELETE SET NULL)
  - `cost_center_id` (UUID, Foreign Key zu `cost_centers`, ON DELETE SET NULL)
  - `deleted_activity_name` (Text, Optional) - zwischengespeicherter Name
  - `deleted_cost_center_name` (Text, Optional) - zwischengespeicherter Name

**ON DELETE SET NULL Strategie:**
- Wenn Tätigkeit/Kostenstelle gelöscht wird → `activity_id`/`cost_center_id` wird NULL
- Name wird vorher in `deleted_activity_name`/`deleted_cost_center_name` gespeichert
- Zeiterfassung bleibt erhalten, zeigt aber "Gelöschte Tätigkeit" an

### Validierungs-Regeln

**Name (Tätigkeiten + Kostenstellen):**
- Pflichtfeld
- Mindestens 2 Zeichen
- Maximal 100 Zeichen
- Duplikate sind erlaubt (mit Warnung: "Name existiert bereits. Trotzdem erstellen?")

**Beschreibung:**
- Optional
- Maximal 500 Zeichen

**Nummer (nur Kostenstellen):**
- Optional
- Maximal 20 Zeichen
- Keine Format-Validierung (Admin kann frei wählen)

**Löschen:**
- System prüft vor Löschung: Wird Stammdatum in Zeiterfassungen verwendet?
- Falls ja → Zeige Warnung mit Anzahl betroffener Zeiterfassungen

### Mitarbeiter-Dropdowns (für PROJ-4 vorbereiten)

**Wie erscheinen Tätigkeiten/Kostenstellen in Mitarbeiter-Dropdowns?**
- **Sortierung:** Alphabetisch (A-Z)
- **Anzeige:** Nur Name (keine Beschreibung)
- **Nur aktive:** Keine gelöschten Stammdaten werden angezeigt
- **Optional:** Kostenstellen-Nummer wird mit angezeigt (z.B. "KST-001 - Projekt A")

---

## Zusammenfassung des Designs

### Was wird gebaut?
1. **2 neue Admin-Seiten:** `/admin/activities` + `/admin/cost-centers`
2. **10 neue API Endpoints:** CRUD für Tätigkeiten + Kostenstellen + Public Endpoints
3. **2 neue Datenbank-Tabellen:** `activities` + `cost_centers`
4. **6 neue Components:** (je Seite: Table, CreateDialog, EditDialog - wiederverwendbar aus PROJ-2)
5. **Seed Data:** Initial-Daten beim ersten Setup

### Was ist besonders?
- **Smart Delete:** Admin bekommt Warnung bei verwendeten Stammdaten
- **Usage Counter:** Zeigt, wie oft Stammdatum genutzt wird
- **Hard Delete mit Historie:** Gelöschte Stammdaten behalten Namen in Zeiterfassungen
- **Duplicate Warning:** Admin wird gewarnt bei doppelten Namen
- **Wiederverwendung:** Fast alle Components/Patterns aus PROJ-2 können wiederverwendert werden

---

## Implementierungsstatus

### ✅ Frontend Implementation (Abgeschlossen am 2026-02-12)

**Implementierte Pages:**
- `/src/app/admin/page.tsx` - Dashboard erweitert mit Tätigkeiten & Kostenstellen Cards
- `/src/app/admin/activities/page.tsx` - Tätigkeiten-Verwaltung mit Search & Sort
- `/src/app/admin/cost-centers/page.tsx` - Kostenstellen-Verwaltung mit Search & Sort

**Implementierte Components (Tätigkeiten):**
- `/src/components/admin/ActivitiesTable.tsx` - Responsive Tabelle (Desktop + Mobile Cards)
- `/src/components/admin/CreateActivityDialog.tsx` - Dialog zum Erstellen
- `/src/components/admin/EditActivityDialog.tsx` - Dialog zum Bearbeiten
- `/src/components/admin/DeleteActivityDialog.tsx` - Smart Delete Dialog mit Usage-Check

**Implementierte Components (Kostenstellen):**
- `/src/components/admin/CostCentersTable.tsx` - Responsive Tabelle (Desktop + Mobile Cards)
- `/src/components/admin/CreateCostCenterDialog.tsx` - Dialog zum Erstellen
- `/src/components/admin/EditCostCenterDialog.tsx` - Dialog zum Bearbeiten
- `/src/components/admin/DeleteCostCenterDialog.tsx` - Smart Delete Dialog mit Usage-Check

**Features:**
- ✅ Responsive Design (Desktop Tabelle / Mobile Cards)
- ✅ Search & Sort Funktionen (Name, Nummer, Erstellungsdatum, Verwendungen)
- ✅ Smart Delete Dialog (2 Varianten: Ungenutzt vs. In Verwendung)
- ✅ Loading, Error und Empty States
- ✅ Form Validation (Client-side)
- ✅ Toast Notifications (Success/Error)
- ✅ Admin Authorization Check (nur Admins haben Zugriff)
- ✅ HofZeit Brand Design (Blau & Grün Gradient)
- ✅ Accessibility (ARIA labels, Keyboard navigation)
- ✅ TypeScript Build erfolgreich

**Design-Pattern:**
- Wiederverwendet alle Patterns aus PROJ-2 (User-Verwaltung)
- Gradient Background: `from-blue-50 to-green-50`
- shadcn/ui Components für alle UI-Elemente
- Konsistentes Design mit bestehenden Admin-Seiten

**Ausstehend:**
- ⏳ Backend API Endpoints müssen implementiert werden
- ⏳ Datenbank-Tabellen (`activities`, `cost_centers`) müssen erstellt werden
- ⏳ Admin-Endpoints mit `requireAdmin()` sichern
- ⏳ Usage Count Berechnung im Backend
- ⏳ Seed Data Script für Initial-Daten

### ⏳ Backend Implementation (Ausstehend)

**Zu implementierende API Endpoints:**

**Tätigkeiten (Admin-Endpoints):**
- ⏳ `GET /api/admin/activities` - Liste aller Tätigkeiten
  - Query Params: `search` (optional)
  - Response: `{ activities: Activity[] }`
  - Jedes Activity-Object muss `usageCount` enthalten
- ⏳ `POST /api/admin/activities` - Neue Tätigkeit anlegen
  - Body: `{ name: string, description?: string }`
  - Validation: Name 2-100 Zeichen, Beschreibung max. 500 Zeichen
- ⏳ `PATCH /api/admin/activities/[id]` - Tätigkeit bearbeiten
  - Body: `{ name?: string, description?: string }`
- ⏳ `DELETE /api/admin/activities/[id]` - Tätigkeit löschen
  - Vor Löschung: Zeiterfassungen mit dieser ID auf NULL setzen
  - Name in `deleted_activity_name` zwischenspeichern

**Kostenstellen (Admin-Endpoints):**
- ⏳ `GET /api/admin/cost-centers` - Liste aller Kostenstellen
  - Query Params: `search` (optional)
  - Response: `{ costCenters: CostCenter[] }`
  - Jedes CostCenter-Object muss `usageCount` enthalten
- ⏳ `POST /api/admin/cost-centers` - Neue Kostenstelle anlegen
  - Body: `{ name: string, number?: string, description?: string }`
  - Validation: Name 2-100 Zeichen, Nummer max. 20 Zeichen
- ⏳ `PATCH /api/admin/cost-centers/[id]` - Kostenstelle bearbeiten
  - Body: `{ name?: string, number?: string, description?: string }`
- ⏳ `DELETE /api/admin/cost-centers/[id]` - Kostenstelle löschen
  - Vor Löschung: Zeiterfassungen mit dieser ID auf NULL setzen
  - Name in `deleted_cost_center_name` zwischenspeichern

**Mitarbeiter-Zugriff (für PROJ-4 vorbereiten):**
- ⏳ `GET /api/activities` - Public Endpoint für alle User
  - Keine Admin-Check, nur Login-Check
  - Alphabetisch sortiert (A-Z)
- ⏳ `GET /api/cost-centers` - Public Endpoint für alle User
  - Keine Admin-Check, nur Login-Check
  - Alphabetisch sortiert (A-Z)

**Zu implementierende Backend-Komponenten:**
- ⏳ Database Migration: Tabellen `activities` + `cost_centers` erstellen
- ⏳ Drizzle Schema Update: Schema Definitionen für neue Tabellen
- ⏳ Zod Validation Schemas (Server-side)
- ⏳ Usage Count Berechnung:
  ```sql
  SELECT COUNT(*) FROM time_entries
  WHERE activity_id = ? OR cost_center_id = ?
  ```
- ⏳ Seed Script: Initial-Daten anlegen
  - Tätigkeiten: "Büroarbeit", "Außendienst", "Fahrtätigkeit"
  - Kostenstellen: "Allgemein" (Nummer: "KST-001")

**Security:**
- Admin-Endpoints nutzen `requireAdmin()` (bereits vorhanden aus PROJ-2)
- Public-Endpoints `/api/activities` und `/api/cost-centers` brauchen nur Login-Check

**Datenbank-Schema:**
```sql
-- Tabelle: activities
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activities_name ON activities(name);

-- Tabelle: cost_centers
CREATE TABLE cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  number VARCHAR(20),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cost_centers_name ON cost_centers(name);
CREATE INDEX idx_cost_centers_number ON cost_centers(number);

-- Auto-Update Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cost_centers_updated_at
  BEFORE UPDATE ON cost_centers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**WICHTIG für PROJ-4 (Zeiterfassung):**
- Zeiterfassungs-Tabelle `time_entries` muss später diese Spalten haben:
  - `activity_id` (UUID, Foreign Key, ON DELETE SET NULL)
  - `cost_center_id` (UUID, Foreign Key, ON DELETE SET NULL)
  - `deleted_activity_name` (TEXT, Optional)
  - `deleted_cost_center_name` (TEXT, Optional)

---

## Nächste Schritte

### 1. Backend Implementation
Der **Backend Developer** muss jetzt die API-Endpoints und Datenbank-Tabellen implementieren:
```
Lies .claude/agents/backend-dev.md und implementiere /features/PROJ-3-admin-stammdaten-verwaltung.md
```

**Backend Checklist:**
- [ ] Datenbank-Migration für `activities` + `cost_centers` erstellen
- [ ] Drizzle Schema definieren
- [ ] Admin API Endpoints implementieren (8 Endpoints)
- [ ] Public API Endpoints implementieren (2 Endpoints)
- [ ] Zod Validation Schemas erstellen
- [ ] Usage Count Berechnung implementieren
- [ ] Delete Logic mit `deleted_*_name` Spalten
- [ ] Seed Script für Initial-Daten
- [ ] TypeScript Build erfolgreich

### 2. QA Testing
Nach Backend-Implementation:
```
Lies .claude/agents/qa-engineer.md und teste /features/PROJ-3-admin-stammdaten-verwaltung.md
```

**QA Test Plan:**
- [ ] Alle 25+ Acceptance Criteria testen
- [ ] Edge Cases (Doppelte Namen, Verwendete Stammdaten löschen, Leere Liste)
- [ ] Smart Delete Dialog (2 Varianten) testen
- [ ] Search & Sort funktioniert
- [ ] Mobile Responsive Design
- [ ] Security: Nicht-Admin kann nicht auf `/admin/activities` zugreifen
- [ ] Performance: Listen laden < 500ms

### 3. Production Deployment
Nach erfolgreichen QA-Tests → Feature ist bereit für Production! 🚀
