# PROJ-3: Admin - Stammdaten-Verwaltung (Tätigkeiten & Kostenstellen)

## Status: 🔵 Planned

## Überblick
Admin-Portal zur Verwaltung von Tätigkeiten und Kostenstellen. Diese Stammdaten werden von Mitarbeitern bei der Zeiterfassung per Dropdown ausgewählt.

## User Stories

- Als **Admin** möchte ich Tätigkeiten anlegen (z.B. "Straßenreinigung", "Grünpflege"), damit Mitarbeiter diese bei der Zeiterfassung auswählen können
- Als **Admin** möchte ich Kostenstellen anlegen (z.B. "Projekt A", "Abteilung Straßenbau"), damit Zeiterfassungen korrekt zugeordnet werden
- Als **Admin** möchte ich eine Übersicht aller Tätigkeiten und Kostenstellen sehen, um den Überblick zu behalten
- Als **Admin** möchte ich Tätigkeiten und Kostenstellen bearbeiten, um Tippfehler oder Änderungen zu korrigieren
- Als **Admin** möchte ich Tätigkeiten und Kostenstellen löschen, um ungenutzte Einträge zu entfernen
- Als **Mitarbeiter** möchte ich alle verfügbaren Tätigkeiten und Kostenstellen in Dropdowns sehen, um meine Auswahl zu treffen

## Acceptance Criteria

### Tätigkeiten-Verwaltung

#### Übersicht
- [ ] Tabelle/Liste aller Tätigkeiten
- [ ] Anzeige: Name, Beschreibung, Erstellt am, Anzahl Verwendungen
- [ ] Suchfunktion nach Name
- [ ] Sortierung nach Name, Erstellungsdatum, Verwendungen

#### Tätigkeit erstellen
- [ ] "Neue Tätigkeit" Button öffnet Formular
- [ ] Formular-Felder:
  - Name (Pflichtfeld, max. 100 Zeichen)
  - Beschreibung (Optional, max. 500 Zeichen)
- [ ] "Speichern" Button erstellt Tätigkeit
- [ ] Success Message: "Tätigkeit '[Name]' wurde erstellt"

#### Tätigkeit bearbeiten
- [ ] "Bearbeiten" Button bei jeder Tätigkeit
- [ ] Formular mit vorausgefüllten Daten
- [ ] Editierbare Felder: Name, Beschreibung
- [ ] "Speichern" Button aktualisiert Tätigkeit
- [ ] Success Message: "Änderungen gespeichert"

#### Tätigkeit löschen
- [ ] "Löschen" Button bei jeder Tätigkeit
- [ ] System prüft, ob Tätigkeit in Zeiterfassungen verwendet wird
- [ ] **Fall 1: Nicht verwendet (0 Zeiterfassungen)**
  - Bestätigungs-Dialog: "Möchtest du '[Name]' wirklich löschen?"
  - Nach Bestätigung: Tätigkeit wird permanent gelöscht
  - Success Message: "Tätigkeit '[Name]' wurde gelöscht"
- [ ] **Fall 2: In Verwendung (> 0 Zeiterfassungen)**
  - Warnung-Dialog: "Achtung: '[Name]' wird in [X] Zeiterfassungen verwendet. Wenn du diese Tätigkeit löschst, werden diese Zeiterfassungen auf 'Gelöschte Tätigkeit' gesetzt. Trotzdem löschen?"
  - Button: "Ja, trotzdem löschen" (rot/warning)
  - Nach Bestätigung: Tätigkeit wird gelöscht, Zeiterfassungen behalten Referenz auf gelöschte ID
  - Success Message: "Tätigkeit '[Name]' wurde gelöscht. [X] Zeiterfassungen wurden aktualisiert."

### Kostenstellen-Verwaltung

#### Übersicht
- [ ] Tabelle/Liste aller Kostenstellen
- [ ] Anzeige: Name, Nummer (optional), Beschreibung, Erstellt am, Anzahl Verwendungen
- [ ] Suchfunktion nach Name oder Nummer
- [ ] Sortierung nach Name, Nummer, Erstellungsdatum, Verwendungen

#### Kostenstelle erstellen
- [ ] "Neue Kostenstelle" Button öffnet Formular
- [ ] Formular-Felder:
  - Name (Pflichtfeld, max. 100 Zeichen)
  - Nummer (Optional, z.B. "KST-001", max. 20 Zeichen)
  - Beschreibung (Optional, max. 500 Zeichen)
- [ ] "Speichern" Button erstellt Kostenstelle
- [ ] Success Message: "Kostenstelle '[Name]' wurde erstellt"

#### Kostenstelle bearbeiten
- [ ] "Bearbeiten" Button bei jeder Kostenstelle
- [ ] Formular mit vorausgefüllten Daten
- [ ] Editierbare Felder: Name, Nummer, Beschreibung
- [ ] "Speichern" Button aktualisiert Kostenstelle
- [ ] Success Message: "Änderungen gespeichert"

#### Kostenstelle löschen
- [ ] "Löschen" Button bei jeder Kostenstelle
- [ ] System prüft, ob Kostenstelle in Zeiterfassungen verwendet wird
- [ ] **Fall 1: Nicht verwendet (0 Zeiterfassungen)**
  - Bestätigungs-Dialog: "Möchtest du '[Name]' wirklich löschen?"
  - Nach Bestätigung: Kostenstelle wird permanent gelöscht
  - Success Message: "Kostenstelle '[Name]' wurde gelöscht"
- [ ] **Fall 2: In Verwendung (> 0 Zeiterfassungen)**
  - Warnung-Dialog: "Achtung: '[Name]' wird in [X] Zeiterfassungen verwendet. Wenn du diese Kostenstelle löschst, werden diese Zeiterfassungen auf 'Gelöschte Kostenstelle' gesetzt. Trotzdem löschen?"
  - Button: "Ja, trotzdem löschen" (rot/warning)
  - Nach Bestätigung: Kostenstelle wird gelöscht, Zeiterfassungen behalten Referenz auf gelöschte ID
  - Success Message: "Kostenstelle '[Name]' wurde gelöscht. [X] Zeiterfassungen wurden aktualisiert."

### UX/UI
- [ ] Mobile-optimiert (responsive Tabellen/Cards)
- [ ] Zwei separate Bereiche im Admin-Portal: "Tätigkeiten" und "Kostenstellen"
- [ ] Loading-State bei Operationen
- [ ] Moderne, übersichtliche UI mit smooth Animationen
- [ ] Validierungs-Fehler werden inline im Formular angezeigt

## Edge Cases

### Doppelte Namen
- **Was passiert, wenn eine Tätigkeit/Kostenstelle mit gleichem Namen erstellt wird?**
  - Warnung: "Eine Tätigkeit mit diesem Namen existiert bereits. Trotzdem erstellen?"
  - Admin kann entscheiden (Duplikate sind erlaubt, aber nicht empfohlen)

### Verwendete Stammdaten löschen
- **Was passiert mit Zeiterfassungen, wenn eine verwendete Tätigkeit/Kostenstelle gelöscht wird?**
  - Zeiterfassungen behalten die ID der gelöschten Tätigkeit/Kostenstelle
  - Anzeige in Zeiterfassungs-Übersicht: "Gelöschte Tätigkeit" oder "Gelöschte Kostenstelle" (grau/ausgegraut)
  - Optional: Name wird in Zeiterfassungs-Tabelle zwischengespeichert (deleted_activity_name)
  - Begründung: Historie muss für Prüfstelle erhalten bleiben

- **Kann eine gelöschte Tätigkeit/Kostenstelle wiederhergestellt werden?**
  - Nein, Löschung ist permanent
  - Admin muss neue Tätigkeit/Kostenstelle mit gleichem Namen anlegen
  - Alte Zeiterfassungen behalten Referenz auf gelöschte ID

### Leere Liste
- **Was passiert, wenn keine Tätigkeiten/Kostenstellen angelegt sind?**
  - Mitarbeiter können keine Zeiterfassungen erstellen (Dropdown ist leer)
  - Error Message: "Keine Tätigkeiten verfügbar. Bitte kontaktiere den Administrator."
  - Empfehlung: Admin sollte Initial-Daten beim Setup anlegen

### Initial-Daten
- **Gibt es vordefinierte Tätigkeiten/Kostenstellen beim Setup?**
  - Ja, Beispiel-Daten beim ersten Start:
    - Tätigkeiten: "Büroarbeit", "Außendienst", "Fahrtätigkeit"
    - Kostenstellen: "Allgemein"
  - Admin kann diese anpassen oder löschen

### Sortierung in Dropdowns
- **In welcher Reihenfolge erscheinen Tätigkeiten/Kostenstellen in Mitarbeiter-Dropdowns?**
  - Alphabetisch sortiert (A-Z)
  - Alle nicht-gelöschten Einträge werden angezeigt

### Beschreibungsfeld
- **Wird die Beschreibung den Mitarbeitern angezeigt?**
  - Nein, nur für Admin-interne Notizen
  - Kann später als Tooltip ergänzt werden (optional)

## Technische Anforderungen

### Performance
- Listen laden < 500ms (auch bei 100+ Einträgen)
- Create/Update Operationen < 300ms

### Security
- Nur Admin-Rolle hat Zugriff auf diese Funktionen
- Mitarbeiter-Rolle: Read-only Zugriff (für Dropdowns)

### Datenbank
- Tätigkeiten und Kostenstellen werden physisch gelöscht (Hard Delete)
- Zeiterfassungen speichern deleted_activity_name und deleted_cost_center_name für gelöschte Referenzen
- Timestamps: created_at, updated_at
- Foreign Keys: ON DELETE SET NULL (Zeiterfassungen behalten NULL-Referenz)

## Abhängigkeiten
- **Benötigt:** PROJ-1 (User Authentication) - für Admin-Rollen-Check
- **Benötigt vor:** PROJ-4 (Zeiterfassung) - Stammdaten müssen vorhanden sein

## Hinweise für Implementierung
- Initial-Daten (Seed Data) sollten beim ersten Setup automatisch angelegt werden
- Stammdaten-Import (CSV/Excel) kann später ergänzt werden
- Hierarchische Kostenstellen (z.B. Hauptkostenstelle → Unterkostenstelle) sind nicht Teil des MVP
