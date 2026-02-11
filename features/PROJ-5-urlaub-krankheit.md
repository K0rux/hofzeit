# PROJ-5: Urlaub/Krankheit erfassen

## Status: 🔵 Planned

## Überblick
Mitarbeiter können Urlaubs- und Krankheitstage erfassen. Das System tracked automatisch das Urlaubskontingent (verfügbare/verbrauchte Tage).

## User Stories

- Als **Mitarbeiter** möchte ich Urlaubstage erfassen, um meine Abwesenheit zu dokumentieren
- Als **Mitarbeiter** möchte ich Krankheitstage erfassen, um Fehltage zu dokumentieren
- Als **Mitarbeiter** möchte ich mein Urlaubskontingent sehen (verfügbar/verbraucht), um zu wissen, wie viele Urlaubstage ich noch habe
- Als **Mitarbeiter** möchte ich einen Zeitraum für Urlaub/Krankheit auswählen (Von-Bis), um mehrere Tage auf einmal zu erfassen
- Als **Mitarbeiter** möchte ich meine erfassten Abwesenheiten sehen, um einen Überblick zu haben
- Als **Mitarbeiter** möchte ich erfasste Abwesenheiten bearbeiten/löschen, um Fehler zu korrigieren
- Als **System** möchte ich automatisch die verbrauchten Urlaubstage zählen, um das Kontingent aktuell zu halten

## Acceptance Criteria

### Urlaubskontingent-Anzeige
- [ ] Dashboard zeigt Urlaubskontingent des eingeloggten Mitarbeiters
- [ ] Anzeige:
  - Gesamt-Kontingent (z.B. 30 Tage/Jahr)
  - Verbraucht (z.B. 12 Tage)
  - Verfügbar (z.B. 18 Tage)
- [ ] Visuell ansprechend (z.B. Progress Bar, Card)
- [ ] Aktualisiert automatisch nach jeder Urlaubs-Erfassung

### Abwesenheit erfassen

#### Formular
- [ ] "Abwesenheit erfassen" Button öffnet Formular
- [ ] Formular-Felder:
  - **Typ** (Dropdown, Pflichtfeld)
    - Optionen: "Urlaub", "Krankheit"
  - **Von Datum** (Date-Picker, Pflichtfeld)
  - **Bis Datum** (Date-Picker, Pflichtfeld)
  - **Notiz** (Textarea, Optional, max. 500 Zeichen)
- [ ] System berechnet automatisch Anzahl der Tage (inkl. Wochenenden)
- [ ] Anzeige: "5 Tage (inkl. Wochenende)" während der Eingabe
- [ ] "Speichern" Button erstellt Abwesenheit(en)
- [ ] Success Message: "Urlaub vom [Von] bis [Bis] wurde erfasst (5 Tage)"

#### Validierung
- [ ] Alle Pflichtfelder müssen ausgefüllt sein
- [ ] "Bis Datum" muss >= "Von Datum" sein
- [ ] Datum darf nicht in abgeschlossenem Monat liegen
- [ ] Bei Urlaub: Warnung, wenn verfügbares Kontingent überschritten wird
  - "Achtung: Du hast nur noch 3 Urlaubstage verfügbar, aber erfasst 5 Tage. Trotzdem fortfahren?"
  - Mitarbeiter kann trotzdem speichern (Admin-Freigabe implizit)
- [ ] Validierungs-Fehler werden inline angezeigt

### Abwesenheits-Übersicht

#### Liste
- [ ] Übersicht aller Abwesenheiten (Urlaub + Krankheit) des aktuellen Jahres
- [ ] Anzeige pro Eintrag: Typ, Von-Bis Datum, Anzahl Tage, Notiz
- [ ] Gruppierung nach Typ (Urlaub, Krankheit)
- [ ] Sortierung: Neueste zuerst
- [ ] Gesamt-Statistik:
  - "Urlaub: 12 Tage verbraucht"
  - "Krankheit: 3 Tage"

#### Filterung
- [ ] Jahr wechseln (Dropdown: aktuelles Jahr, letztes Jahr)
- [ ] Filter nach Typ (Alle / Nur Urlaub / Nur Krankheit)

### Abwesenheit bearbeiten
- [ ] "Bearbeiten" Button bei jeder Abwesenheit (nur offene Monate)
- [ ] Formular mit vorausgefüllten Daten
- [ ] Alle Felder editierbar (Typ, Von-Bis, Notiz)
- [ ] Bei Typ-Wechsel (Urlaub ↔ Krankheit): Urlaubskontingent wird neu berechnet
- [ ] "Speichern" Button aktualisiert Abwesenheit
- [ ] Success Message: "Änderungen gespeichert"

### Abwesenheit löschen
- [ ] "Löschen" Button bei jeder Abwesenheit (nur offene Monate)
- [ ] Bestätigungs-Dialog: "Möchtest du die Abwesenheit vom [Von] bis [Bis] wirklich löschen?"
- [ ] Nach Bestätigung: Eintrag wird gelöscht
- [ ] Urlaubskontingent wird automatisch aktualisiert
- [ ] Success Message: "Abwesenheit gelöscht"

### Urlaubskontingent-Berechnung
- [ ] System zählt alle erfassten Urlaubstage des aktuellen Jahres
- [ ] Formel: Verfügbar = Gesamt-Kontingent - Verbraucht
- [ ] Krankheitstage zählen NICHT gegen Urlaubskontingent
- [ ] Wochenenden zählen MIT (vereinfachte Berechnung für MVP)

### UX/UI
- [ ] Mobile-optimiert
- [ ] Moderne, übersichtliche Kalender/Listen-Ansicht
- [ ] Urlaubskontingent-Card prominent platziert (z.B. oben im Dashboard)
- [ ] Loading-State bei Operationen
- [ ] Smooth Animationen
- [ ] Visuell unterscheidbar: Urlaub (z.B. grün) vs Krankheit (z.B. rot)

## Edge Cases

### Überschneidende Abwesenheiten
- **Was passiert, wenn ein Mitarbeiter zwei überschneidende Abwesenheiten erfasst (z.B. 1.-5. Feb Urlaub, 3.-7. Feb Krankheit)?**
  - Warnung: "Achtung: Es existiert bereits eine Abwesenheit vom 1.-5. Feb. Möchtest du trotzdem fortfahren?"
  - System erlaubt es (Admin kann später korrigieren)
  - Alternative: Späterer Eintrag überschreibt/ersetzt früheren (kann gewählt werden)

### Abgeschlossener Monat
- **Was passiert, wenn ein Mitarbeiter eine Abwesenheit für einen abgeschlossenen Monat erfassen will?**
  - Datum-Feld zeigt nur Tage aus offenen Monaten
  - Versuch zu speichern: Error Message "Monat ist abgeschlossen. Bitte kontaktiere den Administrator."
  - Bearbeiten/Löschen Buttons sind bei abgeschlossenen Monaten ausgeblendet

### Negatives Urlaubskontingent
- **Was passiert, wenn ein Mitarbeiter mehr Urlaub erfasst als verfügbar?**
  - Warnung wird angezeigt, aber Speichern ist erlaubt
  - Urlaubskontingent kann negativ werden (z.B. -2 Tage)
  - Admin muss manuell prüfen/genehmigen

### Jahreswechsel
- **Was passiert mit dem Urlaubskontingent beim Jahreswechsel?**
  - Urlaubskontingent wird automatisch auf Gesamt-Kontingent zurückgesetzt (z.B. 30 Tage)
  - Verbrauchte Tage des Vorjahres bleiben historisch erhalten
  - Übertrag von Resturlaub ist nicht Teil des MVP (kann später ergänzt werden)

### Wochenenden & Feiertage
- **Zählen Wochenenden als Urlaubstage?**
  - Ja, für MVP vereinfacht: Alle Tage im Zeitraum zählen
  - Beispiel: 1.-5. Februar (Mo-Fr) = 5 Tage, 1.-7. Februar (Mo-So) = 7 Tage
  - Feiertage werden nicht automatisch ausgeschlossen (kann später ergänzt werden)

### Halbe Tage
- **Kann ein Mitarbeiter halbe Urlaubstage erfassen (z.B. 0.5 Tage)?**
  - Nein, nur ganze Tage im MVP
  - Alternative: Mitarbeiter erfasst halben Tag als Zeiterfassung (4h statt 8h)

### Mehrere Abwesenheits-Typen
- **Gibt es weitere Typen außer Urlaub/Krankheit (z.B. Sonderurlaub, Fortbildung)?**
  - Nur Urlaub und Krankheit für MVP
  - Weitere Typen können später ergänzt werden

### Admin sieht Urlaubskontingent
- **Kann der Admin die Urlaubskontingente aller Mitarbeiter sehen?**
  - Ja, in PROJ-7 (Admin - Zeiten-Übersicht)
  - Admin kann dort auch Abwesenheiten einsehen

## Technische Anforderungen

### Performance
- Urlaubskontingent-Berechnung < 100ms
- Abwesenheits-Liste lädt < 500ms

### Datenbank
- Tabelle: absences (id, user_id, type, start_date, end_date, notes, created_at, updated_at)
- Index auf (user_id, start_date, end_date)
- Type: ENUM ('urlaub', 'krankheit')

### Berechnung
- Anzahl Tage: `(end_date - start_date) + 1` (inkl. beide Tage)
- Urlaubskontingent kommt aus User-Tabelle (siehe PROJ-2)

## Abhängigkeiten
- **Benötigt:** PROJ-1 (User Authentication) - für eingeloggte User
- **Benötigt:** PROJ-2 (User-Verwaltung) - für Urlaubskontingent pro User
- **Benötigt vor:** PROJ-6 (Monatsabschluss) - Abwesenheiten müssen vorhanden sein
- **Benötigt vor:** PROJ-8 (PDF Export) - Daten zum Exportieren

## Hinweise für Implementierung
- Wochenenden-Berechnung kann später verfeinert werden (MVP zählt alle Tage)
- Feiertags-Kalender kann später integriert werden
- Urlaubs-Genehmigung (Admin approves) ist nicht Teil des MVP
- Übertrag von Resturlaub ins nächste Jahr kann später ergänzt werden
