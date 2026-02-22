# PROJ-10: Monatsabschluss

## Status: Planned
**Created:** 2026-02-22
**Last Updated:** 2026-02-22

## Dependencies
- Requires: PROJ-1 (Benutzerauthentifizierung) – Nutzer muss eingeloggt sein
- Requires: PROJ-4 (Zeiterfassung) – Zeiteinträge werden nach Abschluss schreibgeschützt
- Requires: PROJ-5 (Abwesenheitsverwaltung) – Abwesenheiten werden ebenfalls schreibgeschützt

## Beschreibung
Mitarbeiter können einen abgeschlossenen Monat formal abschließen. Nach dem Abschluss können weder Zeiteinträge noch Abwesenheiten des Monats verändert oder gelöscht werden (Schreibschutz). Der Admin kann einen Abschluss bei Bedarf aufheben. Ist ein Monat 14 Tage nach seinem Ende noch nicht abgeschlossen, wird er automatisch geschlossen.

## User Stories
- Als Mitarbeiter möchte ich meinen vergangenen Monat manuell abschließen, damit meine Zeiterfassung als vollständig und unveränderlich markiert wird.
- Als Mitarbeiter möchte ich vor dem Abschluss eine Zusammenfassung des Monats sehen (Gesamtstunden, Abwesenheiten), damit ich prüfen kann, ob alles korrekt ist.
- Als Mitarbeiter möchte ich sehen, welche meiner vergangenen Monate bereits abgeschlossen sind, damit ich den Überblick behalte.
- Als Mitarbeiter möchte ich nach dem Abschluss keine Änderungen mehr an Zeiteinträgen des abgeschlossenen Monats vornehmen können, damit die Daten unveränderlich sind.
- Als Admin möchte ich den Abschluss eines Mitarbeiters aufheben können, damit Korrekturen nachträglich möglich sind (z.B. bei Fehlern).
- Als Mitarbeiter und Admin möchte ich, dass ein Monat automatisch abgeschlossen wird, wenn der Mitarbeiter es vergessen hat (14 Tage nach Monatsende).

## Acceptance Criteria
- [ ] Mitarbeiter sieht in der Zeiterfassungs-Übersicht für jeden vergangenen Monat einen Status: „Offen" oder „Abgeschlossen"
- [ ] Mitarbeiter kann für offene vergangene Monate einen „Monat abschließen"-Button betätigen
- [ ] Vor dem Abschluss erscheint eine Bestätigungs-Zusammenfassung: Gesamtstunden, Anzahl Einträge, Anzahl Abwesenheiten, Hinweis auf Unveränderlichkeit
- [ ] Nach Bestätigung wird der Monat als abgeschlossen markiert (Timestamp, Nutzer-ID)
- [ ] Alle Zeiteinträge und Abwesenheiten des abgeschlossenen Monats sind schreibgeschützt: Bearbeiten- und Löschen-Buttons sind deaktiviert/ausgeblendet
- [ ] Neue Zeiteinträge können nicht mehr für einen abgeschlossenen Monat erstellt werden
- [ ] Abgeschlossene Monate sind visuell klar gekennzeichnet (z.B. Badge „Abgeschlossen", Schloss-Icon)
- [ ] Admin-Bereich zeigt pro Mitarbeiter den Abschluss-Status aller Monate des aktuellen Jahres
- [ ] Admin kann den Abschluss eines Monats aufheben (mit Bestätigungsdialog); der Monat wechselt zurück zu „Offen"
- [ ] Automatischer Abschluss: Ein Cron-Job oder geplanter Task schließt alle offenen Monate, die mehr als 14 Tage zurückliegen, automatisch ab
- [ ] Bei automatischem Abschluss wird kein Nutzer benachrichtigt (stille Operation), der Status ist aber in der Übersicht sichtbar
- [ ] Der laufende aktuelle Monat kann nicht abgeschlossen werden (nur vergangene Monate)
- [ ] Schreibschutz wird sowohl im Frontend als auch über RLS auf Datenbankebene durchgesetzt

## Edge Cases
- Was passiert, wenn ein Mitarbeiter den aktuellen Monat abschließen will? → Button ist nicht verfügbar für den laufenden Monat; nur vergangene Monate können abgeschlossen werden.
- Was passiert, wenn ein Monat keine Einträge hat? → Mitarbeiter kann ihn trotzdem abschließen (leerer Monat); Zusammenfassung zeigt 0 Stunden.
- Was passiert, wenn der Admin einen Monat aufhebt und der Mitarbeiter dann neue Einträge macht? → Korrekt: Einträge sind wieder editierbar bis zum nächsten Abschluss.
- Was passiert beim automatischen Abschluss mit falschen/unvollständigen Daten? → Das System schließt trotzdem ab; der Admin kann nachträglich aufheben und der Mitarbeiter kann korrigieren.
- Was passiert, wenn der Cron-Job fehlschlägt? → Offene Monate bleiben offen; beim nächsten Lauf werden sie nachgeholt.
- Was passiert mit Monaten aus vergangenen Jahren? → Dieselben Regeln gelten; auch ältere Monate können manuell abgeschlossen oder vom Admin geöffnet werden.
- Was passiert, wenn ein Mitarbeiter deaktiviert wird und offene Monate hat? → Admin kann Monate des Mitarbeiters manuell abschließen oder offen lassen.

## Technical Requirements
- Neue DB-Tabelle `monatsabschluesse` (user_id, Jahr, Monat, abgeschlossen_am, abgeschlossen_durch, automatisch boolean)
- RLS: Mitarbeiter kann eigene Abschlüsse lesen und erstellen; Admin kann alle lesen, erstellen und löschen (= aufheben)
- Schreibschutz für Zeiteinträge und Abwesenheiten: API-Routen prüfen vor jeder Mutation, ob der Monat abgeschlossen ist
- Automatischer Abschluss: Supabase Edge Function mit `pg_cron` oder externer Cron-Dienst (z.B. Vercel Cron), täglicher Lauf
- Validierung: Abschluss nur für Monate `< aktueller Monat`

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
