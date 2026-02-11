# PROJ-7: Admin - Zeiten-Übersicht

## Status: 🔵 Planned

## Überblick
Admin-Portal zur Einsicht aller Zeiterfassungen und Abwesenheiten aller Mitarbeiter. Der Admin kann Daten **nur ansehen, nicht bearbeiten**.

## User Stories

- Als **Admin** möchte ich alle Zeiterfassungen aller Mitarbeiter sehen, um einen Gesamtüberblick zu haben
- Als **Admin** möchte ich nach Mitarbeiter, Monat und Tätigkeit filtern, um spezifische Daten zu finden
- Als **Admin** möchte ich die Gesamt-Stundenzahl pro Mitarbeiter sehen, um Auslastung zu prüfen
- Als **Admin** möchte ich alle Abwesenheiten (Urlaub/Krankheit) aller Mitarbeiter sehen, um Überschneidungen zu erkennen
- Als **Admin** möchte ich sehen, welche Mitarbeiter welche Monate abgeschlossen haben, um den Status zu kontrollieren
- Als **Admin** möchte ich Urlaubskontingente aller Mitarbeiter sehen, um Verfügbarkeit zu prüfen
- Als **Admin** möchte ich **keine** Zeiterfassungen bearbeiten (nur ansehen), um versehentliche Änderungen zu verhindern

## Acceptance Criteria

### Zeiten-Übersicht (Read-Only)

#### Dashboard
- [ ] Übersicht aller Zeiterfassungen aller Mitarbeiter
- [ ] Anzeige pro Eintrag: Mitarbeiter, Datum, Tätigkeit, Kostenstelle, Stunden, Notiz
- [ ] Tabellen-Ansicht mit Sortierung (Mitarbeiter, Datum, Stunden)
- [ ] Paginierung (z.B. 50 Einträge pro Seite)
- [ ] Gesamt-Stundenzahl über alle sichtbaren Einträge angezeigt

#### Filterung
- [ ] Filter nach Mitarbeiter (Dropdown, Mehrfachauswahl möglich)
- [ ] Filter nach Monat/Jahr (Date-Range-Picker)
- [ ] Filter nach Tätigkeit (Dropdown)
- [ ] Filter nach Kostenstelle (Dropdown)
- [ ] Filter nach Status: Alle / Nur abgeschlossene Monate / Nur offene Monate
- [ ] "Filter zurücksetzen" Button
- [ ] Filter bleiben nach Reload erhalten (URL-Parameter)

#### Statistiken
- [ ] Statistik-Cards oben im Dashboard:
  - Gesamt-Stunden (aktueller Monat, alle Mitarbeiter)
  - Anzahl aktive Mitarbeiter
  - Anzahl offene Monate
  - Anzahl abgeschlossene Monate (aktueller Monat)
- [ ] Klick auf Card filtert entsprechend (z.B. Klick auf "Offene Monate" → zeigt nur offene)

### Mitarbeiter-Detail-Ansicht

#### Detail-Seite
- [ ] Klick auf Mitarbeiter-Name öffnet Detail-Ansicht
- [ ] Anzeige:
  - Mitarbeiter-Info (Name, E-Mail, Rolle)
  - Urlaubskontingent (Gesamt, Verbraucht, Verfügbar)
  - Liste aller Zeiterfassungen dieses Mitarbeiters
  - Liste aller Abwesenheiten dieses Mitarbeiters
  - Liste aller Monatsabschlüsse (Datum + Status)
- [ ] Filter nach Monat/Jahr
- [ ] Gesamt-Stundenzahl für gefilterten Zeitraum

### Abwesenheits-Übersicht

#### Liste
- [ ] Separate Ansicht "Abwesenheiten" im Admin-Portal
- [ ] Übersicht aller Abwesenheiten aller Mitarbeiter
- [ ] Anzeige pro Eintrag: Mitarbeiter, Typ (Urlaub/Krankheit), Von-Bis Datum, Anzahl Tage, Notiz
- [ ] Kalender-Ansicht (optional): Zeigt alle Abwesenheiten als Events
- [ ] Filterung:
  - Nach Mitarbeiter
  - Nach Typ (Urlaub / Krankheit)
  - Nach Zeitraum

#### Urlaubskontingent-Übersicht
- [ ] Separate Ansicht "Urlaubskontingente" im Admin-Portal
- [ ] Übersicht aller Mitarbeiter mit Urlaubskontingent
- [ ] Anzeige pro Mitarbeiter:
  - Name
  - Gesamt-Kontingent
  - Verbraucht (aktuelles Jahr)
  - Verfügbar
  - Progress Bar (visuell)
- [ ] Sortierung nach Verfügbar (aufsteigend/absteigend)
- [ ] Warnung bei negativem Kontingent (rot markiert)

### Monatsabschluss-Übersicht
- [ ] Siehe PROJ-6 (Monatsabschluss aufheben)
- [ ] Übersicht welche Mitarbeiter welche Monate abgeschlossen haben
- [ ] "Aufheben" Button (siehe PROJ-6)

### Export-Funktion
- [ ] "Als CSV exportieren" Button in jeder Ansicht
- [ ] CSV enthält aktuell gefilterte Daten
- [ ] CSV-Spalten: Mitarbeiter, Datum, Tätigkeit, Kostenstelle, Stunden, Notiz

### UX/UI
- [ ] Desktop-optimiert (große Tabellen)
- [ ] Responsive Design (auch auf Tablet nutzbar)
- [ ] Loading-State bei Daten-Laden
- [ ] Moderne, übersichtliche UI
- [ ] Smooth Animationen bei Filter-Änderungen
- [ ] **Keine** Bearbeiten/Löschen Buttons (Read-Only!)

## Edge Cases

### Keine Daten vorhanden
- **Was passiert, wenn keine Zeiterfassungen vorhanden sind?**
  - Leere-State Ansicht: "Noch keine Zeiterfassungen vorhanden"
  - Hinweis: "Mitarbeiter können über das Dashboard Zeiten erfassen"

### Große Datenmengen
- **Wie handhaben wir große Datenmengen (z.B. 10.000+ Zeiterfassungen)?**
  - Paginierung (50 Einträge pro Seite)
  - Server-seitige Filterung (nicht alles in Browser laden)
  - Lazy Loading bei Scroll (optional)

### Filtern ohne Treffer
- **Was passiert, wenn Filter keine Treffer liefern?**
  - Leere-State Ansicht: "Keine Einträge gefunden"
  - Hinweis: "Versuche andere Filter-Einstellungen"
  - "Filter zurücksetzen" Button prominent angezeigt

### CSV-Export große Dateien
- **Was passiert bei sehr großen CSV-Exporten (z.B. 10.000 Zeilen)?**
  - Warnung: "Achtung: Export enthält [X] Einträge und kann einige Sekunden dauern"
  - Loading-Spinner während Export
  - Download startet automatisch

### Zeitzone
- **In welcher Zeitzone werden Zeiten angezeigt?**
  - Server-Zeitzone (z.B. Europe/Berlin)
  - Konsistent über alle Ansichten

### Abgeschlossene vs Offene Monate
- **Werden abgeschlossene Monate visuell unterschieden?**
  - Ja, z.B. grüner Hintergrund oder Badge "Abgeschlossen ✓"
  - Filter-Checkbox: "Nur abgeschlossene" / "Nur offene"

### Admin kann nicht bearbeiten
- **Warum kann der Admin nicht bearbeiten?**
  - Design-Entscheidung: Verhindert versehentliche Änderungen
  - Wenn Korrektur nötig: Admin hebt Monatsabschluss auf (PROJ-6), Mitarbeiter korrigiert selbst
  - Alternative: Admin-Edit-Rechte können später ergänzt werden (nicht MVP)

### Mitarbeiter-Account deaktiviert
- **Werden Daten von deaktivierten Mitarbeitern angezeigt?**
  - Ja, vollständig sichtbar
  - Filter-Option: "Nur aktive Mitarbeiter" / "Alle Mitarbeiter"

## Technische Anforderungen

### Performance
- Tabellen laden < 1000ms (auch bei 1000+ Einträgen mit Paginierung)
- Filter-Operationen < 500ms
- CSV-Export < 3000ms (bei 1000 Zeilen)

### Security
- Nur Admin-Rolle hat Zugriff auf diese Funktionen
- Mitarbeiter-Rolle: Keine Sichtbarkeit auf andere Mitarbeiter

### Datenbank
- Effiziente Queries mit Indexes auf (user_id, date, activity_id, cost_center_id)
- Server-seitige Filterung (kein "alle Daten laden")
- Aggregation-Queries für Statistiken

## Abhängigkeiten
- **Benötigt:** PROJ-1 (User Authentication) - für Admin-Rollen-Check
- **Benötigt:** PROJ-4 (Zeiterfassung) - Daten zum Anzeigen
- **Benötigt:** PROJ-5 (Urlaub/Krankheit) - Abwesenheiten zum Anzeigen
- **Benötigt:** PROJ-6 (Monatsabschluss) - Status zum Anzeigen

## Hinweise für Implementierung
- Read-Only ist wichtig: Keine Edit/Delete-Funktionen für Admin
- Server-seitige Paginierung + Filterung implementieren (nicht alles in Frontend laden)
- CSV-Export kann mit Library wie `papaparse` oder `csv-writer` realisiert werden
- Kalender-Ansicht für Abwesenheiten kann mit `react-big-calendar` realisiert werden (optional für MVP)
