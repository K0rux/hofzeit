# PROJ-4: Zeiterfassung erstellen

## Status: 🔵 Planned

## Überblick
Mitarbeiter können ihre täglichen Arbeitszeiten erfassen. Eine Zeiterfassung besteht aus Datum, Tätigkeit, Kostenstelle und geleisteten Stunden.

## User Stories

- Als **Mitarbeiter** möchte ich meine Arbeitszeit für einen bestimmten Tag erfassen, um meine geleisteten Stunden zu dokumentieren
- Als **Mitarbeiter** möchte ich Tätigkeit und Kostenstelle aus Dropdowns auswählen, um die Zuordnung korrekt vorzunehmen
- Als **Mitarbeiter** möchte ich meine erfassten Zeiten für den aktuellen Monat sehen, um einen Überblick zu haben
- Als **Mitarbeiter** möchte ich bereits erfasste Zeiten bearbeiten, um Fehler zu korrigieren
- Als **Mitarbeiter** möchte ich bereits erfasste Zeiten löschen, um versehentliche Einträge zu entfernen
- Als **Mitarbeiter** möchte ich rückwirkend Zeiten für vergangene Tage im aktuellen Monat erfassen, um vergessene Einträge nachzuholen
- Als **Mitarbeiter** möchte ich die Gesamt-Stundenzahl für den aktuellen Monat sehen, um meine Arbeitszeit zu kontrollieren

## Acceptance Criteria

### Zeiterfassung erstellen

#### Formular
- [ ] "Neue Zeiterfassung" Button öffnet Formular
- [ ] Formular-Felder:
  - **Datum** (Date-Picker, Pflichtfeld)
    - Standardwert: Heutiges Datum
    - Nur Tage im aktuellen Monat auswählbar (nicht abgeschlossen)
  - **Tätigkeit** (Dropdown, Pflichtfeld)
    - Liste aller aktiven Tätigkeiten (alphabetisch sortiert)
  - **Kostenstelle** (Dropdown, Pflichtfeld)
    - Liste aller aktiven Kostenstellen (alphabetisch sortiert)
  - **Stunden** (Number Input, Pflichtfeld)
    - Format: Dezimal (z.B. 8.5 für 8 Stunden 30 Minuten)
    - Min: 0.25 (15 Minuten), Max: 24
    - Schritt: 0.25
  - **Notiz** (Textarea, Optional, max. 500 Zeichen)
    - Für zusätzliche Informationen
- [ ] "Speichern" Button erstellt Zeiterfassung
- [ ] Success Message: "Zeiterfassung für [Datum] wurde gespeichert"
- [ ] Formular schließt nach erfolgreichem Speichern

#### Validierung
- [ ] Alle Pflichtfelder müssen ausgefüllt sein
- [ ] Stunden müssen zwischen 0.25 und 24 liegen
- [ ] Datum darf nicht in abgeschlossenem Monat liegen
- [ ] Validierungs-Fehler werden inline angezeigt

### Zeiterfassungs-Übersicht

#### Liste/Kalender-Ansicht
- [ ] Übersicht aller Zeiterfassungen des aktuellen Monats
- [ ] Anzeige pro Eintrag: Datum, Tätigkeit, Kostenstelle, Stunden, Notiz
- [ ] Gruppierung nach Datum (neueste zuerst)
- [ ] Gesamt-Stundenzahl für den Monat wird angezeigt (z.B. "Summe: 145.5h")
- [ ] Leere Tage werden angezeigt (z.B. "5. Februar - Keine Erfassung")

#### Filterung
- [ ] Monat wechseln (Dropdown: aktueller Monat, letzte 3 Monate)
- [ ] Nur abgeschlossene Monate sind read-only (siehe PROJ-6)

### Zeiterfassung bearbeiten
- [ ] "Bearbeiten" Button bei jeder Zeiterfassung (nur offene Monate)
- [ ] Formular mit vorausgefüllten Daten
- [ ] Alle Felder editierbar (Datum, Tätigkeit, Kostenstelle, Stunden, Notiz)
- [ ] "Speichern" Button aktualisiert Zeiterfassung
- [ ] Success Message: "Änderungen gespeichert"

### Zeiterfassung löschen
- [ ] "Löschen" Button bei jeder Zeiterfassung (nur offene Monate)
- [ ] Bestätigungs-Dialog: "Möchtest du die Zeiterfassung vom [Datum] wirklich löschen?"
- [ ] Nach Bestätigung: Eintrag wird gelöscht
- [ ] Success Message: "Zeiterfassung gelöscht"

### UX/UI
- [ ] Mobile-optimiert (Touch-freundliche Inputs)
- [ ] Moderne, übersichtliche Kalender/Listen-Ansicht
- [ ] Loading-State bei Operationen
- [ ] Smooth Animationen (z.B. Slide-in bei Formular)
- [ ] Quick-Add-Button (z.B. FAB) für schnelle Erfassung
- [ ] Date-Picker ist touch-optimiert (große Targets)

## Edge Cases

### Mehrere Einträge pro Tag
- **Kann ein Mitarbeiter mehrere Zeiterfassungen für denselben Tag erstellen?**
  - Ja, erlaubt (z.B. morgens "Straßenreinigung" 4h, nachmittags "Grünpflege" 4h)
  - Jede Kombination aus Datum + Tätigkeit + Kostenstelle ist erlaubt

### Abgeschlossener Monat
- **Was passiert, wenn ein Mitarbeiter eine Zeiterfassung für einen abgeschlossenen Monat erstellen will?**
  - Datum-Feld zeigt nur Tage aus offenen Monaten
  - Versuch zu speichern: Error Message "Monat ist abgeschlossen. Bitte kontaktiere den Administrator."
  - Bearbeiten/Löschen Buttons sind bei abgeschlossenen Monaten ausgeblendet

### Fehlende Stammdaten
- **Was passiert, wenn keine Tätigkeiten/Kostenstellen vorhanden sind?**
  - Formular zeigt Error Message: "Keine Tätigkeiten verfügbar. Bitte kontaktiere den Administrator."
  - "Speichern" Button ist disabled

### Überstunden
- **Gibt es eine Warnung bei ungewöhnlich hohen Stunden (z.B. 12h an einem Tag)?**
  - Ja, Warnung bei > 10h: "Achtung: Du erfasst mehr als 10 Stunden. Ist das korrekt?"
  - Mitarbeiter kann trotzdem speichern (keine Blockierung)

### Dezimal-Format
- **Wie geben Mitarbeiter halbe Stunden ein?**
  - Input akzeptiert Dezimal: 8.5 = 8 Stunden 30 Minuten
  - Alternativ: 0.5 = 30 Minuten, 0.25 = 15 Minuten
  - UI-Hinweis: "Beispiel: 8.5 für 8 Stunden 30 Minuten"

### Zukünftige Datums-Einträge
- **Kann ein Mitarbeiter Zeiten für zukünftige Tage erfassen?**
  - Ja, erlaubt (für Planung oder Vorerfassung)
  - Max: Bis Ende des aktuellen Monats

### Leere Tage
- **Muss ein Mitarbeiter für jeden Tag eine Zeiterfassung erstellen?**
  - Nein, optional
  - Hinweis in Übersicht: "5 Tage ohne Erfassung in diesem Monat"

### Wochenenden/Feiertage
- **Sind Wochenenden/Feiertage speziell markiert?**
  - Ja, visuelle Markierung (z.B. graue Hintergrundfarbe)
  - Aber: Erfassung ist trotzdem möglich (z.B. Bereitschaftsdienst)

## Technische Anforderungen

### Performance
- Zeiterfassungs-Liste lädt < 500ms (auch bei 100+ Einträgen)
- Create/Update Operationen < 300ms

### Mobile (PWA)
- Touch-optimierte Inputs (Date-Picker, Number-Spinner)
- Responsive Design
- Offline-Fähigkeit (optional für MVP, kann später ergänzt werden)

### Datenbank
- Foreign Keys: user_id, activity_id (Tätigkeit), cost_center_id (Kostenstelle)
- Felder: date, hours (Decimal), notes (Text)
- Index auf (user_id, date) für schnelle Abfragen

## Abhängigkeiten
- **Benötigt:** PROJ-1 (User Authentication) - für eingeloggte User
- **Benötigt:** PROJ-3 (Stammdaten-Verwaltung) - für Tätigkeiten & Kostenstellen
- **Benötigt vor:** PROJ-6 (Monatsabschluss) - Zeiterfassungen müssen vorhanden sein
- **Benötigt vor:** PROJ-8 (PDF Export) - Daten zum Exportieren

## Hinweise für Implementierung
- Kalender-Ansicht kann mit einer Library wie `react-big-calendar` oder `fullcalendar` realisiert werden
- Dezimal-Format für Stunden ist wichtig (nicht HH:MM)
- Soft Delete für Zeiterfassungen (falls Admin-Wiederherstellung später gewünscht)
