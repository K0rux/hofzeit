# PROJ-9: Mitarbeiter-Arbeitszeitprofil

## Status: Planned
**Created:** 2026-02-22
**Last Updated:** 2026-02-22

## Dependencies
- Requires: PROJ-1 (Benutzerauthentifizierung) – Nutzer muss eingeloggt sein
- Requires: PROJ-2 (Benutzerverwaltung Admin) – Admin verwaltet Mitarbeiter-Stammdaten
- Requires: PROJ-4 (Zeiterfassung) – Soll-Ist-Vergleich basiert auf erfassten Zeiten
- Requires: PROJ-5 (Abwesenheitsverwaltung) – Urlaubskonsum wird gegen Kontingent gerechnet

## Beschreibung
Der Admin kann für jeden Mitarbeiter ein Arbeitszeitprofil hinterlegen: Jährliches Urlaubskontingent (Tage), reguläre Arbeitstage (z.B. Montag–Freitag) und wöchentliche Sollstunden. Der Mitarbeiter sieht eine Übersicht seines Urlaubskontos (genommen vs. verfügbar) sowie seinen Soll-Ist-Stundenvergleich. Im Zeiterfassungs-Kalender wird ein Tag farblich hervorgehoben, sobald die Tages-Sollstunden erreicht oder überschritten wurden.

## User Stories
- Als Admin möchte ich für jeden Mitarbeiter das jährliche Urlaubskontingent (Tage) festlegen, damit das System den Resturlaub korrekt berechnen kann.
- Als Admin möchte ich die regulären Arbeitstage des Mitarbeiters definieren (Wochentage, z.B. Mo–Fr), damit die Sollstunden korrekt ermittelt werden.
- Als Admin möchte ich die wöchentliche Soll-Stundenzahl pro Mitarbeiter hinterlegen (z.B. 40h/Woche), damit der Soll-Ist-Vergleich möglich ist.
- Als Mitarbeiter möchte ich meinen verbleibenden Resturlaub auf einen Blick sehen (verfügbar, genommen, verbleibend), damit ich meine Urlaube planen kann.
- Als Mitarbeiter möchte ich im Kalender sehen, an welchen Tagen ich meine Sollarbeitszeit erreicht habe (farbliche Markierung), damit ich meinen Fortschritt verfolgen kann.
- Als Mitarbeiter möchte ich eine Monatsübersicht meiner Soll- vs. Ist-Stunden sehen, damit ich erkennen kann, ob ich im Plan liege.

## Acceptance Criteria
- [ ] Admin-Bereich enthält pro Mitarbeiter ein Formular für das Arbeitszeitprofil: Urlaubstage/Jahr (Ganzzahl), Arbeitstage (Mehrfachauswahl Mo–So), Wochenstunden (Dezimalzahl, z.B. 40.0)
- [ ] Das Arbeitszeitprofil ist für jeden Mitarbeiter individuell und unabhängig von anderen Mitarbeitern
- [ ] Admin kann das Profil jederzeit bearbeiten; Änderungen wirken sich sofort auf die Berechnungen aus
- [ ] Mitarbeiter-Übersichtsseite zeigt Urlaubskonto: Jahresanspruch, bereits genommene Tage (aus PROJ-5 Abwesenheiten), verbleibende Tage
- [ ] Mitarbeiter-Übersichtsseite zeigt Stunden-Übersicht für den aktuellen Monat: Soll-Stunden (basierend auf Arbeitstagen im Monat × Tagesstunden), Ist-Stunden (erfasste Zeiteinträge), Differenz (+/−)
- [ ] Im Zeiterfassungs-Kalender (PROJ-4) wird ein Tag grün hinterlegt, wenn die Tages-Sollstunden erreicht oder überschritten wurden
- [ ] Im Zeiterfassungs-Kalender wird ein Tag gelb hinterlegt, wenn Einträge vorhanden, aber Sollstunden noch nicht erreicht
- [ ] Tage ohne jegliche Einträge (an regulären Arbeitstagen) bleiben ohne Markierung oder werden neutral angezeigt
- [ ] Die Kalender-Farbkennzeichnung funktioniert auf Mobile (375px) und ist gut erkennbar
- [ ] Wenn kein Arbeitszeitprofil für einen Mitarbeiter hinterlegt ist, wird keine Farbkennzeichnung angezeigt und keine Berechnung durchgeführt (Fallback: kein Profil vorhanden – Meldung im Admin)
- [ ] Urlaubskonto berücksichtigt nur genehmigte/eingetragene Abwesenheiten vom Typ „Urlaub" (nicht Krankheit)

## Edge Cases
- Was passiert, wenn ein Mitarbeiter noch kein Arbeitszeitprofil hat? → Admin-Bereich zeigt Hinweis „Kein Profil hinterlegt", Mitarbeiter sieht keine Urlaubskonto-Übersicht.
- Was passiert, wenn der Mitarbeiter mehr Urlaub nimmt als das Kontingent erlaubt? → System zeigt negativen Resturlaub (Überschreitung wird angezeigt, aber nicht technisch blockiert).
- Was passiert bei Teilzeit-Mitarbeitern mit ungleichmäßigen Arbeitstagen? → Admin kann beliebige Wochentage als Arbeitstage wählen (z.B. Mo, Mi, Fr).
- Was passiert, wenn Arbeitszeitprofil mitten im Jahr geändert wird? → Neue Werte gelten ab dem Zeitpunkt der Änderung; historische Berechnungen werden nicht rückwirkend neu berechnet.
- Was passiert, wenn ein Mitarbeiter an einem Nicht-Arbeitstag Stunden einträgt? → Einträge werden gespeichert, der Tag wird aber nicht als Soll-Tag gewertet.
- Was passiert bei Feiertagen? → Feiertage werden in MVP nicht automatisch berücksichtigt (kein Feiertagskalender).
- Was passiert, wenn Stunden aus einem laufenden Tag noch nicht vollständig eingetragen sind? → Partiell erfasste Stunden werden bei der Tages-Berechnung berücksichtigt.

## Technical Requirements
- Neue DB-Tabelle `arbeitszeitprofile` (Mitarbeiter-ID, Urlaubstage, Arbeitstage als Array, Wochenstunden)
- RLS: Admin kann alle Profile lesen/schreiben; Mitarbeiter kann nur das eigene Profil lesen
- Soll-Stunden-Berechnung: serverseitig oder im Client (basierend auf Profildaten)
- Kalender-Farbkennzeichnung: muss auf Mobile performant sein (kein Layout-Shift)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
