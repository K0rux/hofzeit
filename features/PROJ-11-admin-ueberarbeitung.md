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
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
