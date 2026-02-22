# PROJ-6: PDF-Export

## Status: In Progress
**Created:** 2026-02-20
**Last Updated:** 2026-02-22

## Dependencies
- Requires: PROJ-1 (Benutzerauthentifizierung) – Nutzer muss eingeloggt sein
- Requires: PROJ-4 (Zeiterfassung) – Zeiteinträge müssen vorhanden sein
- Requires: PROJ-5 (Abwesenheitsverwaltung) – Abwesenheiten werden optional im Export angezeigt

## Beschreibung
Mitarbeiter können ihre erfassten Arbeitszeiten, Tätigkeiten und Kostenstellen für einen wählbaren Zeitraum (z. B. einen Monat) als PDF exportieren. Das PDF enthält eine strukturierte Tabelle aller Einträge sowie eine Zusammenfassung (Gesamtstunden, Aufschlüsselung nach Tätigkeit und Kostenstelle).

## User Stories
- Als Mitarbeiter möchte ich einen Zeitraum (Monat/Jahr oder benutzerdefiniertes Datum) für den Export auswählen, damit ich genau den gewünschten Zeitraum exportieren kann.
- Als Mitarbeiter möchte ich alle meine Zeiteinträge des gewählten Zeitraums als PDF herunterladen, damit ich sie ausdrucken oder einreichen kann.
- Als Mitarbeiter möchte ich, dass das PDF meinen Namen, den Zeitraum, alle Einträge (Datum, Startzeit, Endzeit, Dauer, Tätigkeit, Kostenstelle, Notiz) sowie die Gesamtstunden enthält.
- Als Mitarbeiter möchte ich eine Zusammenfassung im PDF sehen (Gesamtstunden nach Tätigkeit und Kostenstelle), damit die Auswertung auf einen Blick ersichtlich ist.
- Als Mitarbeiter möchte ich auch Abwesenheiten (Urlaub, Krankheit) im PDF sehen, damit das Dokument vollständig ist.

## Acceptance Criteria
- [ ] Export-Seite / Export-Button mit Auswahl des Zeitraums (Monat-/Jahreswähler oder benutzerdefinierter Datumsbereich)
- [ ] PDF enthält Kopfzeile: „Hofzeit – Zeiterfassung" + Name des Mitarbeiters + exportierter Zeitraum + Erstellungsdatum
- [ ] PDF enthält Tabelle mit allen Zeiteinträgen: Datum, Wochentag, Startzeit, Endzeit, Dauer (h:mm), Tätigkeit, Kostenstelle, Notiz
- [ ] PDF enthält Abwesenheiten in separater Sektion oder als Zeilen in der Tabelle (farblich/textuell markiert)
- [ ] PDF enthält Zusammenfassung: Gesamtarbeitsstunden, Aufschlüsselung nach Tätigkeit (Stunden pro Tätigkeit), Aufschlüsselung nach Kostenstelle (Stunden pro Kostenstelle)
- [ ] PDF enthält Urlaubstage und Krankheitstage im Zusammenfassungsbereich (Anzahl Tage)
- [ ] PDF wird direkt im Browser heruntergeladen (keine E-Mail, kein Cloud-Upload)
- [ ] Bei leerem Zeitraum (keine Einträge) wird eine verständliche Meldung ausgegeben (kein leeres PDF)
- [ ] PDF-Layout ist lesbar auf A4 (Hochformat)
- [ ] Export funktioniert auf iPhone (Safari) – Download als PDF

## Edge Cases
- Was passiert, wenn für den gewählten Zeitraum keine Einträge vorhanden sind? → Fehlermeldung/Hinweis „Keine Einträge für diesen Zeitraum" – kein leeres PDF wird erstellt
- Was passiert bei sehr vielen Einträgen (z. B. 30 Tage × 10 Einträge = 300 Zeilen)? → PDF wird mehrseitig; korrekte Seitenumbrüche
- Was passiert, wenn der Export auf iPhone fehlschlägt (Safari-Einschränkungen)? → Fehlermeldung auf Deutsch mit Hinweis
- Was passiert bei sehr langen Tätigkeits-/Kostenstellennamen? → Text wird im PDF abgeschnitten oder umgebrochen (kein Layout-Überlauf)
- Was passiert, wenn keine Tätigkeiten/Kostenstellen vorhanden sind (leere Felder)? → „–" als Platzhalter im PDF

## Technical Requirements
- PDF-Generierung: Client-seitig (z. B. mit jsPDF + autoTable) oder server-seitig – Entscheidung im Architecture-Skill
- Sprache: PDF-Inhalte auf Deutsch
- Dateiname: `hofzeit-export-[nachname]-[YYYY-MM].pdf`
- Sicherheit: Nutzer kann nur eigene Daten exportieren (keine fremden Daten)
- Datenschutz: PDF wird nicht serverseitig gespeichert (nur generiert und direkt übertragen)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Entscheidung: Client-seitige PDF-Generierung
Das PDF wird vollständig im Browser des Nutzers generiert (kein Server-Rendering). Daten werden nicht serverseitig zwischengespeichert — DSGVO-konform.

**Abweichung von Feature-Spec:** Die Zeiterfassungs-Datenbank speichert keine Startzeit/Endzeit, nur die Gesamtdauer. Die PDF-Tabellenspalten wurden entsprechend angepasst: statt „Startzeit / Endzeit / Dauer" nur **„Dauer (Std.)"**.

---

### Komponentenstruktur

```
Export-Seite (/export)
+-- Zeitraum-Auswahl
|   +-- Monats-Wähler  (shadcn Select)
|   +-- Jahres-Wähler  (shadcn Select)
+-- Vorschau-Karte  (shadcn Card — erscheint nach Auswahl)
|   +-- Anzahl Zeiteinträge
|   +-- Gesamtstunden
|   +-- Urlaubstage + Krankheitstage
+-- Leer-Zustand  ("Keine Einträge für diesen Zeitraum")
+-- Export-Button  "PDF herunterladen"  (shadcn Button + Ladeindikator)
```

---

### PDF-Aufbau (A4, Hochformat)

| Abschnitt | Inhalt |
|---|---|
| Kopfzeile | „Hofzeit – Zeiterfassung", Name des Mitarbeiters, Zeitraum, Erstellungsdatum |
| Zeiteinträge-Tabelle | Datum, Wochentag, Dauer (Std.), Tätigkeit, Kostenstelle, Notiz |
| Abwesenheiten-Tabelle | Typ (Urlaub/Krankheit), Von, Bis, Anzahl Tage, Notiz |
| Zusammenfassung | Gesamtstunden, Stunden je Tätigkeit, Stunden je Kostenstelle, Urlaubstage, Krankheitstage |

Mehrseitige Ausgabe wird automatisch von jspdf-autotable verwaltet.

---

### Datenfluss

```
1. User wählt Monat + Jahr
2. App ruft parallel ab:
     GET /api/zeiteintraege?von=YYYY-MM-01&bis=YYYY-MM-DD
     GET /api/abwesenheiten?von=YYYY-MM-01&bis=YYYY-MM-DD
3. Vorschau-Statistiken werden berechnet und angezeigt
4. User klickt "PDF herunterladen"
5. jsPDF + autoTable erstellt das PDF im Browser
6. Browser-Download wird ausgelöst
   Dateiname: hofzeit-export-[nachname]-[YYYY-MM].pdf
```

---

### Backend-Änderungen (minimal)

Beide bestehenden API-Routen werden um optionale Datumsbereich-Parameter erweitert:

| Route | Neue Parameter | Bestehende Parameter |
|---|---|---|
| `GET /api/zeiteintraege` | `von`, `bis` (YYYY-MM-DD) | `date` bleibt unverändert |
| `GET /api/abwesenheiten` | `von`, `bis` (YYYY-MM-DD) | `datum` bleibt unverändert |

Keine neuen Datenbank-Tabellen. Kein Schema-Change.

---

### Tech-Entscheidungen

| Thema | Entscheidung | Begründung |
|---|---|---|
| PDF-Engine | Client-seitig (jsPDF) | iPhone Safari kompatibel, keine Server-Kosten, DSGVO-konform |
| Tabellen | jspdf-autotable | Automatische Seitenumbrüche, gepflegte Library |
| Zeitraum-Auswahl | Monat + Jahr (zwei Selects) | Einfachste UX für monatliche Auswertung; benutzerdefinierter Datumsbereich als Folge-Feature |
| Sicherheit | Bestehende RLS-Policies | Nutzer kann nur eigene Daten über die APIs abrufen |

---

### Neue Abhängigkeiten

| Paket | Zweck |
|---|---|
| `jspdf` | Core-PDF-Generierung im Browser |
| `jspdf-autotable` | Tabellen-Plugin für jsPDF |

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
