# PROJ-5: Abwesenheitsverwaltung (Urlaub & Krankheit)

## Status: Planned
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
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
