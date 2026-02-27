# PROJ-11: Admin-Bereich Überarbeitung

## Status: Planned
**Created:** 2026-02-22
**Last Updated:** 2026-02-22

## Dependencies
- Requires: PROJ-1 (Benutzerauthentifizierung) – Rollenprüfung (Admin vs. Mitarbeiter)
- Requires: PROJ-2 (Benutzerverwaltung Admin) – Admin-Bereich ist Ausgangspunkt
- Requires: PROJ-3 (Tätigkeiten & Kostenstellen) – Kostenstellen-Berechtigungen werden geändert
- Requires: PROJ-6 (PDF-Export) – Basis für Mitarbeiter-Berichte durch Admin

## Beschreibung
Der Admin-Bereich wird funktional überarbeitet: Zeiterfassung und PDF-Export werden aus dem Admin-Menü entfernt (Admins machen keine eigene Zeiterfassung). Kostenstellen-Verwaltung wird auf Admin beschränkt – Mitarbeiter können Kostenstellen nur noch auswählen, nicht anlegen oder bearbeiten. Tätigkeiten bleiben wie bisher durch Mitarbeiter selbst verwaltbar. Neu: Der Admin kann Monatsberichte für einzelne Mitarbeiter als PDF herunterladen.

## User Stories
- Als Admin möchte ich keine Zeiterfassungs-Einträge sehen oder machen müssen, damit meine Ansicht auf administrative Aufgaben fokussiert bleibt.
- Als Admin möchte ich Kostenstellen anlegen, bearbeiten und löschen, damit ich die Auswahl für Mitarbeiter zentral steuern kann.
- Als Mitarbeiter möchte ich Kostenstellen nur noch aus einer vom Admin vorgegebenen Liste auswählen können (nicht selbst anlegen), damit die Kostenstellen einheitlich bleiben.
- Als Mitarbeiter möchte ich weiterhin eigene Tätigkeiten anlegen und verwalten können, da diese arbeitsspezifisch sind.
- Als Admin möchte ich für jeden Mitarbeiter einen Monatsbericht als PDF herunterladen können, damit ich die Zeitnachweise aller Mitarbeiter zentral im Blick habe.
- Als Admin möchte ich beim Herunterladen eines Berichts Monat und Jahr für den jeweiligen Mitarbeiter auswählen können.

## Acceptance Criteria

### Admin-Menü Bereinigung
- [ ] „Zeiterfassung" ist im Admin-Navigationsmenü nicht sichtbar (Menüpunkt entfernt)
- [ ] „PDF-Export" (eigener Export) ist im Admin-Navigationsmenü nicht sichtbar (Menüpunkt entfernt)
- [ ] Admin kann weiterhin auf alle anderen Bereiche zugreifen (Benutzerverwaltung, Stammdaten, Abwesenheiten, Arbeitszeitprofile, Monatsabschlüsse)

### Kostenstellen: Admin-only Verwaltung
- [ ] Kostenstellen-Verwaltung (Anlegen, Bearbeiten, Löschen) ist nur für Admins zugänglich
- [ ] Im Admin-Bereich unter „Stammdaten" können Kostenstellen wie bisher vollständig verwaltet werden
- [ ] Mitarbeiter sehen bei der Zeiterfassung eine Auswahl der vorhandenen Kostenstellen, können aber keine neuen anlegen oder bestehende bearbeiten
- [ ] Die API-Routen für Kostenstellen-Mutations (POST, PUT, DELETE) prüfen die Admin-Rolle serverseitig
- [ ] RLS-Policy für Kostenstellen wird angepasst: INSERT/UPDATE/DELETE nur für Admin-Rolle

### Tätigkeiten: Mitarbeiter-Verwaltung bleibt
- [ ] Tätigkeiten können weiterhin von Mitarbeitern selbst angelegt, bearbeitet und gelöscht werden (keine Änderung gegenüber PROJ-3)

### Admin: Mitarbeiter-Berichte
- [ ] Im Admin-Bereich (Benutzerverwaltung oder eigene Seite) gibt es pro Mitarbeiter einen „Bericht herunterladen"-Button
- [ ] Admin wählt Monat und Jahr aus → PDF-Download startet
- [ ] Der PDF-Bericht enthält dieselben Inhalte wie der Mitarbeiter-Export aus PROJ-6 (Zeiteinträge, Abwesenheiten, Zusammenfassung)
- [ ] Der PDF-Bericht zeigt den Mitarbeiternamen klar im Kopfbereich
- [ ] Wenn für den gewählten Monat keine Einträge vorhanden sind, erscheint eine verständliche Meldung (kein leeres PDF)
- [ ] Der Bericht-Download ist nur für Admins zugänglich (API-Seite prüft Rolle)

## Edge Cases
- Was passiert, wenn ein Admin versehentlich eine Kostenstelle löscht, die in Zeiteinträgen verwendet wird? → Löschung wird blockiert mit Hinweis „Kostenstelle wird in X Einträgen verwendet" (keine Kaskaden-Löschung von Zeiteinträgen).
- Was passiert, wenn Mitarbeiter versuchen, über die API Kostenstellen anzulegen? → RLS blockiert es serverseitig; Fehlermeldung „Keine Berechtigung".
- Was passiert, wenn ein Admin einen Bericht für einen Monat herunterlädt, der noch nicht abgeschlossen ist? → Bericht wird trotzdem generiert mit einem Hinweis „Monat noch offen – Daten können sich noch ändern".
- Was passiert, wenn ein Mitarbeiter deaktiviert wurde und der Admin einen Bericht abruft? → Berichte historischer Monate sind weiterhin abrufbar.
- Was passiert, wenn es keine Kostenstellen mehr gibt (alle gelöscht)? → Zeiterfassungs-Formular zeigt leere Auswahl; Admin wird aufgefordert, Kostenstellen anzulegen.
- Was passiert mit bestehenden Zeiteinträgen, die Kostenstellen enthalten, welche von Mitarbeitern selbst angelegt wurden? → Bestehende Einträge bleiben unverändert; nur das Anlegen neuer Kostenstellen durch Mitarbeiter wird unterbunden.

## Technical Requirements
- RLS-Policy für `kostenstellen`-Tabelle anpassen: INSERT/UPDATE/DELETE nur für `role = 'admin'`
- Middleware/API-Schutz: `POST /api/kostenstellen`, `PUT /api/kostenstellen/[id]`, `DELETE /api/kostenstellen/[id]` prüfen Admin-Rolle
- Admin-PDF-Endpoint: `GET /api/admin/berichte/[userId]?monat=X&jahr=Y` – erzeugt PDF für anderen Nutzer
- Navigations-Konfiguration: Menüpunkte Zeiterfassung und Export für Admin-Rolle ausblenden
- Berechtigungsprüfung: Bestehende `role`-Logik aus PROJ-1/PROJ-2 wird wiederverwendet

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick: 4 Änderungsbereiche

1. **Rollenbasierte Navigation** – Zeiterfassung & Export für Admins ausblenden
2. **Kostenstellen: Admin-only Schreibzugriff** – RLS + API anpassen
3. **Stammdaten-Seite: Rollenabhängige UI** – Mitarbeiter sehen Kostenstellen nur lesend
4. **Admin: Mitarbeiter-Berichte als PDF** – Neuer Dialog + neuer API-Endpunkt

---

### A) Komponentenstruktur

```
Navigation – app-layout.tsx + bottom-nav.tsx
+-- navLinks / tabs werden nach Rolle gefiltert:
    [Admin sieht]:      Dashboard, Abwesenheiten, Stammdaten, Verwaltung
    [Mitarbeiter sieht]: Dashboard, Zeiterfassung, Abwesenheiten, Stammdaten, Export

Admin-Seite – /admin/page.tsx
+-- Benutzerverwaltung-Tabelle (unverändert)
    +-- Dropdown pro Zeile
        +-- Passwort zurücksetzen (unverändert)
        +-- Rolle ändern (unverändert)
        +-- Deaktivieren / Reaktivieren (unverändert)
        +-- [NEU] "Bericht herunterladen"

[NEU] BerichtDialog – src/components/admin/bericht-dialog.tsx
+-- Mitarbeitername (nur anzeigen)
+-- Monats-Auswahl (1–12)
+-- Jahres-Auswahl (aktuelles ± 1 Jahr)
+-- "PDF herunterladen" Button
    → Ruft neuen API-Endpunkt auf → PDF wird client-seitig erzeugt
    → Hinweis-Banner wenn keine Einträge vorhanden (kein leeres PDF)
    → "Monat noch offen"-Hinweis wenn Monat = aktueller Monat

Stammdaten-Seite – /stammdaten/page.tsx
+-- Tätigkeiten-Tab – keine Änderung (alle Nutzer verwalten eigene)
+-- Kostenstellen-Tab
    [Admin]:      "Neue Kostenstelle" + Bearbeiten/Löschen-Buttons (unverändert)
    [Mitarbeiter]: Nur lesbare Liste (keine Buttons, keine Aktionsspalte)
```

---

### B) Datenmodell

Keine neuen Tabellen. Nur RLS-Anpassungen an der bestehenden `kostenstellen`-Tabelle.

```
Tabelle: kostenstellen (Struktur unverändert)
- id, user_id, name, nummer, created_at, updated_at

Aktuell:  jeder Nutzer sieht nur eigene Kostenstellen (user_id-Filter)
Neu:      alle authentifizierten Nutzer können LESEN
          nur Admin kann ANLEGEN / BEARBEITEN / LÖSCHEN
```

Die Spalte `user_id` bleibt für historische Nachvollziehbarkeit, wird aber nicht mehr als Zugriffsfilter verwendet.

---

### C) API-Änderungen

| Endpunkt | Änderung |
|----------|----------|
| `GET /api/kostenstellen` | `user_id`-Filter entfernen – alle Kostenstellen für alle eingeloggten Nutzer |
| `POST /api/kostenstellen` | Admin-Rollenprüfung hinzufügen → 403 für Mitarbeiter |
| `PUT /api/kostenstellen/[id]` | Admin-Rollenprüfung hinzufügen → 403 für Mitarbeiter |
| `DELETE /api/kostenstellen/[id]` | Admin-Rollenprüfung hinzufügen → 403 für Mitarbeiter |
| **[NEU]** `GET /api/admin/berichte/[userId]?monat=X&jahr=Y` | Admin-only: liefert Zeiteinträge + Abwesenheiten + Name eines Mitarbeiters als JSON |

Der bestehende `pdf-generator.ts` wird unverändert wiederverwendet – der Admin-Browser generiert das PDF lokal aus den API-Daten.

---

### D) Datenbankänderungen (nur RLS, keine Schema-Migration)

Nur die Row Level Security Policies der `kostenstellen`-Tabelle werden angepasst:

| Operation | Aktuell | Neu |
|-----------|---------|-----|
| SELECT | Nur eigene Zeilen (`user_id = auth.uid()`) | Alle authentifizierten Nutzer |
| INSERT | Nur eigene Zeilen | Nur Admin-Rolle |
| UPDATE | Nur eigene Zeilen | Nur Admin-Rolle |
| DELETE | Nur eigene Zeilen | Nur Admin-Rolle |

---

### E) Neue Dateien

| Datei | Zweck |
|-------|-------|
| `src/components/admin/bericht-dialog.tsx` | Monats-/Jahresauswahl + PDF-Download-Trigger |
| `src/app/api/admin/berichte/[userId]/route.ts` | Admin-only API: Mitarbeiterdaten für PDF-Generierung |

**Geänderte Dateien:**
- `src/components/app-layout.tsx` – rollengefilterter navLinks-Array
- `src/components/bottom-nav.tsx` – rollengefilterter tabs-Array
- `src/app/admin/page.tsx` – "Bericht herunterladen" Aktion + BerichtDialog
- `src/app/stammdaten/page.tsx` – rollenabhängiger Kostenstellen-Tab
- `src/app/api/kostenstellen/route.ts` – user_id-Filter entfernen; Admin-Prüfung für POST
- `src/app/api/kostenstellen/[id]/route.ts` – Admin-Prüfung für PUT + DELETE

---

### F) Keine neuen npm-Pakete erforderlich

Alle benötigten Bibliotheken (jsPDF, jspdf-autotable, shadcn/ui, Supabase) sind bereits installiert.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
