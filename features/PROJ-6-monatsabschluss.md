# PROJ-6: Monatsabschluss

## Status: 🔵 Planned

## Überblick
Mitarbeiter können am Ende des Monats ihre Zeiterfassungen abschließen, sodass keine weiteren Änderungen möglich sind. Der Admin kann Monatsabschlüsse bei Bedarf wieder aufheben.

## User Stories

- Als **Mitarbeiter** möchte ich meinen aktuellen Monat abschließen, um zu signalisieren, dass alle Zeiterfassungen vollständig sind
- Als **Mitarbeiter** möchte ich eine Übersicht sehen, welche Monate abgeschlossen sind, um den Status zu kennen
- Als **Mitarbeiter** möchte ich in abgeschlossenen Monaten keine Änderungen mehr vornehmen können, um versehentliche Änderungen zu verhindern
- Als **Admin** möchte ich Monatsabschlüsse aufheben, um Korrekturen zu ermöglichen (z.B. wenn Mitarbeiter Fehler melden)
- Als **Admin** möchte ich sehen, welche Mitarbeiter welche Monate bereits abgeschlossen haben, um den Überblick zu behalten
- Als **System** möchte ich sicherstellen, dass abgeschlossene Monate nicht mehr bearbeitet werden können, um Datenintegrität zu gewährleisten

## Acceptance Criteria

### Monatsabschluss durchführen (Mitarbeiter)

#### Button/Funktion
- [ ] "Monat abschließen" Button im Dashboard
- [ ] Button ist nur sichtbar, wenn aktueller Monat noch nicht abgeschlossen ist
- [ ] Button öffnet Bestätigungs-Dialog
- [ ] Bestätigungs-Dialog zeigt:
  - "Möchtest du den Monat [Monat Jahr] abschließen?"
  - "Du kannst danach keine Zeiterfassungen mehr bearbeiten oder löschen."
  - "Gesamt-Stunden: [X.X]h"
  - "Urlaubstage: [X] Tage"
  - "Krankheitstage: [X] Tage"
- [ ] "Abschließen" Button führt Monatsabschluss durch
- [ ] Success Message: "Monat [Monat Jahr] wurde abgeschlossen"
- [ ] Nach Abschluss: Button wird zu "Monat ist abgeschlossen" Badge

#### Validierung
- [ ] Monat kann nur abgeschlossen werden, wenn er in der Vergangenheit liegt oder aktueller Monat ist
- [ ] Zukünftige Monate können nicht abgeschlossen werden
- [ ] Bereits abgeschlossene Monate können nicht erneut abgeschlossen werden

### Status-Anzeige (Mitarbeiter)

#### Übersicht
- [ ] Dashboard zeigt Status für letzte 6 Monate
- [ ] Anzeige pro Monat:
  - Monat/Jahr (z.B. "Januar 2026")
  - Status: "Abgeschlossen ✓" oder "Offen"
  - Abgeschlossen am: Datum + Uhrzeit
- [ ] Visuell unterscheidbar: Abgeschlossen (grün) vs Offen (orange)

### Einschränkungen bei abgeschlossenen Monaten

#### Zeiterfassungen
- [ ] Zeiterfassungen in abgeschlossenen Monaten sind read-only
- [ ] "Bearbeiten" und "Löschen" Buttons sind ausgeblendet
- [ ] "Neue Zeiterfassung" erlaubt keine Datums-Auswahl in abgeschlossenen Monaten
- [ ] Versuch zu speichern: Error Message "Monat ist abgeschlossen"

#### Abwesenheiten
- [ ] Abwesenheiten in abgeschlossenen Monaten sind read-only
- [ ] "Bearbeiten" und "Löschen" Buttons sind ausgeblendet
- [ ] Neue Abwesenheiten mit Datum in abgeschlossenem Monat werden blockiert
- [ ] Versuch zu speichern: Error Message "Monat ist abgeschlossen"

### Monatsabschluss aufheben (Admin)

#### Admin-Portal
- [ ] Übersicht aller Mitarbeiter mit ihren Monatsabschlüssen
- [ ] Anzeige pro Mitarbeiter:
  - Name
  - Liste abgeschlossener Monate (z.B. "Jan 2026, Dez 2025")
  - "Aufheben" Button bei jedem abgeschlossenen Monat
- [ ] "Aufheben" Button öffnet Bestätigungs-Dialog
- [ ] Bestätigungs-Dialog: "Möchtest du den Monatsabschluss von [Mitarbeiter] für [Monat] wirklich aufheben? Der Mitarbeiter kann danach wieder Änderungen vornehmen."
- [ ] "Aufheben" Button hebt Monatsabschluss auf
- [ ] Success Message: "Monatsabschluss für [Mitarbeiter] / [Monat] wurde aufgehoben"
- [ ] Mitarbeiter wird NICHT automatisch benachrichtigt (kann später ergänzt werden)

#### Filterung
- [ ] Filter nach Mitarbeiter (Dropdown)
- [ ] Filter nach Monat (Dropdown)
- [ ] Sortierung: Neueste Abschlüsse zuerst

### UX/UI
- [ ] Mobile-optimiert
- [ ] Moderne, übersichtliche UI
- [ ] Loading-State bei Operationen
- [ ] Smooth Animationen
- [ ] Status-Badge prominent angezeigt (z.B. oben im Dashboard)

## Edge Cases

### Abschluss während Bearbeitung
- **Was passiert, wenn ein Admin den Monatsabschluss aufhebt, während der Mitarbeiter gerade Daten bearbeitet?**
  - Mitarbeiter kann speichern (Monatsabschluss ist aufgehoben)
  - Keine spezielle Benachrichtigung nötig (Rare Edge Case)

### Mehrfacher Abschluss/Aufhebung
- **Kann ein Monat mehrfach abgeschlossen/aufgehoben werden?**
  - Ja, Cycle ist möglich: Abschließen → Admin hebt auf → Mitarbeiter schließt erneut ab
  - Historie wird gespeichert (Audit Log mit Timestamps)

### Abschluss ohne Zeiterfassungen
- **Kann ein Mitarbeiter einen Monat ohne Zeiterfassungen abschließen?**
  - Ja, erlaubt (z.B. durchgehend krank/Urlaub)
  - Warnung: "Achtung: Keine Zeiterfassungen für diesen Monat vorhanden. Trotzdem abschließen?"
  - Mitarbeiter kann entscheiden

### Zukünftige Monate
- **Kann ein Mitarbeiter zukünftige Monate abschließen?**
  - Nein, Error Message: "Nur vergangene oder der aktuelle Monat können abgeschlossen werden"

### Jahreswechsel
- **Was passiert beim Jahreswechsel?**
  - Jeder Monat wird einzeln abgeschlossen (kein "Jahres-Abschluss")
  - Alte Monate (z.B. > 12 Monate) bleiben weiterhin sichtbar in Historie

### Zeitpunkt des Abschlusses
- **Muss ein Mitarbeiter bis zum Monatsende warten?**
  - Nein, aktueller Monat kann jederzeit abgeschlossen werden (z.B. am 15. des Monats)
  - Empfehlung: Erst am Monatsende abschließen

### Abschluss rückgängig machen (Mitarbeiter)
- **Kann ein Mitarbeiter selbst einen Abschluss rückgängig machen?**
  - Nein, nur Admin kann aufheben
  - Mitarbeiter muss Admin kontaktieren

### Benachrichtigung bei Aufhebung
- **Wird der Mitarbeiter benachrichtigt, wenn Admin den Abschluss aufhebt?**
  - Nein, für MVP nicht implementiert
  - Kann später mit E-Mail/In-App-Notification ergänzt werden

### Audit Log
- **Wird protokolliert, wer wann was abgeschlossen/aufgehoben hat?**
  - Ja, Audit Log mit:
    - Monat/Jahr
    - Mitarbeiter (user_id)
    - Aktion: "abgeschlossen" oder "aufgehoben"
    - Durchgeführt von: Mitarbeiter selbst (bei Abschluss) oder Admin (bei Aufhebung)
    - Timestamp
  - Admin kann Audit Log einsehen (in Admin-Portal)

## Technische Anforderungen

### Performance
- Monatsabschluss-Operation < 500ms
- Status-Abfrage < 100ms

### Datenbank
- Tabelle: month_closures (id, user_id, month, year, closed_at, closed_by_user_id, reopened_at, reopened_by_admin_id)
- Index auf (user_id, month, year)
- Status kann aus `reopened_at IS NULL` abgeleitet werden (wenn NULL → abgeschlossen)

### Security
- Nur Mitarbeiter kann eigene Monate abschließen
- Nur Admin kann Monatsabschlüsse aufheben

## Abhängigkeiten
- **Benötigt:** PROJ-1 (User Authentication) - für Rollen-Check
- **Benötigt:** PROJ-4 (Zeiterfassung) - Zeiterfassungen müssen abgeschlossen werden
- **Benötigt:** PROJ-5 (Urlaub/Krankheit) - Abwesenheiten müssen abgeschlossen werden
- **Benötigt vor:** PROJ-8 (PDF Export) - Abgeschlossene Monate werden exportiert

## Hinweise für Implementierung
- Soft Delete Logik: Monat ist "abgeschlossen" wenn `reopened_at IS NULL`
- Audit Log ist wichtig für Compliance (Prüfstelle)
- E-Mail-Benachrichtigung kann später ergänzt werden
- "Monat abschließen" kann auch automatisiert werden (z.B. nach 7 Tagen ohne Änderung) - für MVP nicht implementiert
