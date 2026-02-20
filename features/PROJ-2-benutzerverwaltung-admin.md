# PROJ-2: Benutzerverwaltung (Admin)

## Status: Planned
**Created:** 2026-02-20
**Last Updated:** 2026-02-20

## Dependencies
- Requires: PROJ-1 (Benutzerauthentifizierung) – Admin muss eingeloggt sein

## Beschreibung
Administratoren können im Admin-Bereich neue Benutzerkonten anlegen, bestehende Benutzer einsehen und verwalten, Passwörter zurücksetzen und Konten löschen. Reguläre Mitarbeiter haben keinen Zugang zu diesem Bereich.

## User Stories
- Als Admin möchte ich neue Mitarbeiterkonten anlegen (Name, E-Mail, Passwort, Rolle), damit neue Mitarbeiter die App nutzen können.
- Als Admin möchte ich eine Übersicht aller Benutzer sehen (Name, E-Mail, Rolle, letzter Login), damit ich den Überblick über aktive Nutzer behalte.
- Als Admin möchte ich das Passwort eines Mitarbeiters zurücksetzen (neues Passwort setzen), damit der Mitarbeiter sich wieder einloggen kann.
- Als Admin möchte ich einen Benutzer löschen/deaktivieren, wenn ein Mitarbeiter das Unternehmen verlässt, damit kein unbefugter Zugang mehr möglich ist.
- Als Admin möchte ich die Rolle eines Benutzers ändern können (z. B. Mitarbeiter → Admin), damit flexible Rollenverteilung möglich ist.

## Acceptance Criteria
- [ ] Admin-Bereich ist nur für Nutzer mit Admin-Rolle zugänglich (403 für alle anderen)
- [ ] Formular zum Anlegen eines neuen Benutzers: Vorname, Nachname, E-Mail, Passwort, Rolle (Admin/Mitarbeiter)
- [ ] Alle Pflichtfelder werden validiert (E-Mail-Format, Passwort-Mindestlänge 8 Zeichen)
- [ ] Bestehende Benutzer werden in einer Liste angezeigt (Name, E-Mail, Rolle, Status)
- [ ] Admin kann für jeden Benutzer ein neues Passwort setzen (Bestätigungsdialog)
- [ ] Admin kann einen Benutzer löschen (Bestätigungsdialog mit Warnmeldung)
- [ ] Ein Admin kann sich nicht selbst löschen
- [ ] E-Mail-Adressen müssen eindeutig sein (Fehlermeldung bei Duplikat)
- [ ] Alle Aktionen geben Bestätigungs- oder Fehlermeldungen auf Deutsch aus

## Edge Cases
- Was passiert, wenn der letzte Admin gelöscht werden soll? → Löschen verhindern, Fehlermeldung anzeigen
- Was passiert bei doppelter E-Mail-Adresse? → Fehlermeldung „Diese E-Mail-Adresse ist bereits vergeben"
- Was passiert mit den Zeiteinträgen eines gelöschten Mitarbeiters? → Zeiteinträge bleiben erhalten (historische Daten), Benutzer wird deaktiviert (nicht hart gelöscht)
- Was passiert, wenn ein Admin die eigene Rolle ändert? → Eigene Rolle kann nicht geändert werden (Schutz)
- Was passiert bei sehr kurzem Passwort beim Reset? → Validierungsfehler, Mindestlänge 8 Zeichen erzwingen

## Technical Requirements
- Sicherheit: Rollenprüfung server-seitig (nicht nur client-seitig)
- DSGVO: Gelöschte/deaktivierte Benutzer werden als inaktiv markiert, nicht sofort hart gelöscht (Aufbewahrungspflicht für Zeitdaten)
- Passwörter: Nur als Hash gespeichert, niemals im Klartext

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
