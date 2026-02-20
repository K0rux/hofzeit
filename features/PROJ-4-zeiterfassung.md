# PROJ-4: Zeiterfassung

## Status: Planned
**Created:** 2026-02-20
**Last Updated:** 2026-02-20

## Dependencies
- Requires: PROJ-1 (Benutzerauthentifizierung) – Nutzer muss eingeloggt sein
- Requires: PROJ-3 (Tätigkeiten & Kostenstellen) – Auswahllisten müssen vorhanden sein

## Beschreibung
Mitarbeiter können täglich ihre Arbeitszeiten erfassen, indem sie für jeden Zeiteintrag ein Datum, eine Start- und Endzeit (oder Dauer), eine Tätigkeit und eine Kostenstelle angeben. Einträge können bearbeitet und gelöscht werden. Eine Tagesübersicht zeigt alle Einträge des gewählten Tages. Eine Monatsübersicht zeigt alle Einträge des Monats.

## User Stories
- Als Mitarbeiter möchte ich einen neuen Zeiteintrag anlegen (Datum, Startzeit, Endzeit, Tätigkeit, Kostenstelle, optional Notiz), damit meine Arbeit korrekt dokumentiert ist.
- Als Mitarbeiter möchte ich Tätigkeit und Kostenstelle aus meinen eigenen Listen auswählen (Dropdown), damit die Eingabe schnell und fehlerfrei ist.
- Als Mitarbeiter möchte ich einen Zeiteintrag bearbeiten, wenn ich einen Fehler gemacht habe.
- Als Mitarbeiter möchte ich einen Zeiteintrag löschen, wenn er versehentlich angelegt wurde.
- Als Mitarbeiter möchte ich meine Einträge des heutigen Tages auf einen Blick sehen, damit ich den Überblick behalte.
- Als Mitarbeiter möchte ich zu einem vergangenen Datum navigieren, damit ich vergessene Einträge nachtragen kann.
- Als Mitarbeiter möchte ich die Gesamtarbeitszeit des Tages automatisch berechnet sehen.

## Acceptance Criteria
- [ ] Formular für neuen Zeiteintrag: Datum (Datepicker, Standard: heute), Startzeit, Endzeit, Tätigkeit (Dropdown), Kostenstelle (Dropdown), Notiz (optional, max. 255 Zeichen)
- [ ] Berechnete Dauer (Stunden und Minuten) wird aus Start- und Endzeit ermittelt und angezeigt
- [ ] Tätigkeit und Kostenstelle Dropdowns sind mit den eigenen Listen des Nutzers befüllt
- [ ] Alle Pflichtfelder (Datum, Startzeit, Endzeit, Tätigkeit, Kostenstelle) werden validiert
- [ ] Endzeit muss nach Startzeit liegen (Validierung mit Fehlermeldung)
- [ ] Tagesansicht: Alle Einträge des gewählten Tages sortiert nach Startzeit anzeigen
- [ ] Gesamtarbeitszeit des Tages wird summiert und angezeigt
- [ ] Jeder Eintrag hat Bearbeiten- und Löschen-Schaltflächen
- [ ] Löschen erfordert Bestätigung
- [ ] Navigation zu vorherigen/nächsten Tagen möglich
- [ ] Mitarbeiter sehen nur ihre eigenen Zeiteinträge
- [ ] Formular und Liste sind auf iPhone (375px) vollständig bedienbar

## Edge Cases
- Was passiert, wenn Startzeit und Endzeit gleich sind? → Validierungsfehler „Endzeit muss nach Startzeit liegen"
- Was passiert, wenn kein Tätigkeit/Kostenstellen in der Liste vorhanden sind? → Hinweis „Bitte zuerst Tätigkeiten/Kostenstellen anlegen" mit Link zu PROJ-3
- Was passiert bei überlappenden Zeiteinträgen? → In MVP keine automatische Prüfung, Nutzer ist eigenverantwortlich
- Was passiert, wenn das Datum in der Zukunft liegt? → Einträge für zukünftige Tage sind erlaubt (Planung möglich)
- Was passiert bei einem Tag ohne Einträge? → Leerer Zustand mit Hinweis „Noch keine Einträge für diesen Tag"
- Was passiert bei einem Eintrag über Mitternacht (z. B. 22:00–01:00)? → In MVP nicht unterstützt, Validierung verhindert Endzeit < Startzeit

## Technical Requirements
- Sicherheit: API-seitige Überprüfung, dass Nutzer nur eigene Einträge lesen/schreiben kann
- Performance: Tagesansicht lädt in < 300ms
- Mobil: Datepicker und Timepicker sind Touch-optimiert (native Browser-Inputs verwenden)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
