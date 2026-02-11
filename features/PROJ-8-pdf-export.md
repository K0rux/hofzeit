# PROJ-8: PDF Export

## Status: 🔵 Planned

## Überblick
Mitarbeiter können ihre erfassten Zeiterfassungen und Abwesenheiten für einen Monat als PDF exportieren, um sie an die Prüfstelle weiterzuleiten.

## User Stories

- Als **Mitarbeiter** möchte ich meine Zeiterfassungen für einen Monat als PDF exportieren, um sie an die Prüfstelle zu senden
- Als **Mitarbeiter** möchte ich nur abgeschlossene Monate exportieren, um sicherzustellen, dass die Daten vollständig sind
- Als **PDF** soll professionell aussehen mit Logo, Header und strukturierter Darstellung
- Als **PDF** sollen alle Zeiterfassungen, Abwesenheiten und Gesamt-Summen enthalten sein

## Acceptance Criteria

### PDF Export (Mitarbeiter)

#### Export-Button
- [ ] "Als PDF exportieren" Button im Dashboard (bei Monats-Übersicht)
- [ ] Button öffnet Export-Dialog
- [ ] Export-Dialog zeigt:
  - Dropdown: Monat auswählen (nur abgeschlossene Monate)
  - Vorschau: "Gesamt-Stunden: [X]h, Urlaubstage: [X], Krankheitstage: [X]"
  - "PDF generieren" Button
- [ ] Klick auf "PDF generieren" → PDF wird erstellt und automatisch heruntergeladen
- [ ] Success Message: "PDF für [Monat] wurde erstellt"
- [ ] Loading-Spinner während PDF-Generierung

#### PDF-Inhalt (Mitarbeiter-Export)
- [ ] **Header:**
  - Logo "HofZeit" (optional, falls vorhanden)
  - Titel: "Zeiterfassung"
  - Mitarbeiter: [Vorname Nachname]
  - Monat/Jahr: [z.B. Januar 2026]
  - Exportiert am: [Datum + Uhrzeit]
  - Status: "Monat abgeschlossen am [Datum]"

- [ ] **Zeiterfassungen (Tabelle):**
  - Spalten: Datum, Tätigkeit, Kostenstelle, Stunden, Notiz
  - Sortierung: Nach Datum (aufsteigend)
  - Gruppierung nach Datum (optional)
  - Summe: Gesamt-Stunden am Ende der Tabelle

- [ ] **Abwesenheiten (Tabelle):**
  - Spalten: Typ, Von Datum, Bis Datum, Anzahl Tage, Notiz
  - Sortierung: Nach Von-Datum (aufsteigend)
  - Summen:
    - Urlaubstage: [X] Tage
    - Krankheitstage: [X] Tage

- [ ] **Gesamt-Zusammenfassung:**
  - Gesamt-Arbeitsstunden: [X]h
  - Urlaubstage: [X] Tage
  - Krankheitstage: [X] Tage
  - Urlaubskontingent: [Verbraucht] / [Gesamt] Tage (aktuelles Jahr)

- [ ] **Footer:**
  - Seitenzahl (z.B. "Seite 1 von 2")
  - Generiert mit HofZeit (optional)

#### PDF-Design
- [ ] Professionelles Layout (nicht nur Plain-Text)
- [ ] Firmen-Logo oben (falls vorhanden)
- [ ] Klare Tabellen mit Borders/Grid-Lines
- [ ] Lesbare Schriftgröße (min. 10pt)
- [ ] Schwarz/Weiß-Druck-freundlich (keine dunklen Hintergründe)

### Validierung
- [ ] Nur abgeschlossene Monate können exportiert werden
- [ ] Error Message bei offenen Monaten: "Monat muss zuerst abgeschlossen werden"
- [ ] Leere Monate (keine Zeiterfassungen) können trotzdem exportiert werden (z.B. durchgehend krank/Urlaub)

### UX/UI
- [ ] Mobile-optimiert (Button + Dialog)
- [ ] Loading-State während PDF-Generierung (kann 1-3 Sekunden dauern)
- [ ] Download startet automatisch (kein manueller "Speichern"-Dialog)
- [ ] Dateiname: `HofZeit_[Mitarbeiter]_[Monat-Jahr].pdf` (z.B. `HofZeit_Max-Mustermann_Januar-2026.pdf`)

## Edge Cases

### Leerer Monat
- **Was passiert, wenn ein Monat keine Zeiterfassungen hat?**
  - PDF wird trotzdem generiert
  - Zeiterfassungs-Tabelle zeigt: "Keine Zeiterfassungen in diesem Monat"
  - Gesamt-Stunden: 0h

### Sehr lange Notizen
- **Was passiert bei sehr langen Notizen (> 500 Zeichen)?**
  - Notiz wird umgebrochen (Mehrzeilig in Tabelle)
  - Falls zu lang: Abschneiden mit "..." (max. 200 Zeichen im PDF)

### Umlaute & Sonderzeichen
- **Werden Umlaute korrekt dargestellt?**
  - Ja, UTF-8 Encoding
  - Testen: ä, ö, ü, ß, €, etc.

### PDF-Generierung fehlgeschlagen
- **Was passiert, wenn PDF-Generierung fehlschlägt?**
  - Error Message: "PDF konnte nicht erstellt werden. Bitte versuche es erneut."
  - Log-Eintrag für Admin/Debugging

### Mehrfacher Export
- **Kann ein Mitarbeiter denselben Monat mehrfach exportieren?**
  - Ja, kein Limit (z.B. falls Datei verloren ging)
  - Jeder Export ist identisch (gleiche Daten)

### PDF-Größe
- **Wie groß sind die PDFs?**
  - Typisch: 50-200 KB (1 Monat, ~20 Zeiterfassungen)
  - Max: ~1 MB (bei sehr vielen Einträgen + Notizen)

### Browser-Kompatibilität
- **Funktioniert PDF-Download in allen Browsern?**
  - Ja, Server-seitige PDF-Generierung (nicht Browser-abhängig)
  - Download via `Content-Disposition: attachment`

## Technische Anforderungen

### Performance
- PDF-Generierung < 3 Sekunden (1 Monat, ~50 Zeiterfassungen)

### PDF-Library
- Empfohlen: `jsPDF` + `jspdf-autotable` (Client-seitig) oder `puppeteer`/`pdfkit` (Server-seitig)
- Alternative: `react-pdf` für deklaratives PDF-Layout
- Server-seitige Generierung bevorzugt (weniger Browser-Probleme)

### Datenbank
- Keine zusätzliche Tabelle nötig (PDF wird on-the-fly generiert)
- Optional: Audit Log "PDF exportiert" (Timestamp + user_id + month)

### API
- Endpoint: `POST /api/export/pdf`
- Request Body: `{ userId: number, month: string, year: number }`
- Response: Binary PDF-Datei (Content-Type: `application/pdf`)

## Abhängigkeiten
- **Benötigt:** PROJ-1 (User Authentication) - für eingeloggte User
- **Benötigt:** PROJ-4 (Zeiterfassung) - Daten zum Exportieren
- **Benötigt:** PROJ-5 (Urlaub/Krankheit) - Abwesenheiten zum Exportieren
- **Benötigt:** PROJ-6 (Monatsabschluss) - nur abgeschlossene Monate exportierbar

## Hinweise für Implementierung
- Server-seitige PDF-Generierung ist robuster als Client-seitig (Browser-Rendering kann variieren)
- Testen mit echten Daten (lange Notizen, Umlaute, viele Einträge)
- Logo als Base64 oder URL im PDF einbetten (nicht externer Link)
- PDF sollte druckbar sein (A4 Format, Hochformat)
- Optional: E-Mail-Versand nach Export (nicht MVP, kann später ergänzt werden)
