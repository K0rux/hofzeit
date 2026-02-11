# PROJ-2: Admin - User-Verwaltung

## Status: 🔵 Planned

## Überblick
Admin-Portal zur Verwaltung von Mitarbeiter-Accounts. Nur Admins können neue User anlegen, bearbeiten und deaktivieren.

## User Stories

- Als **Admin** möchte ich neue Mitarbeiter-Accounts erstellen, um neuen Mitarbeitern Zugriff zu geben
- Als **Admin** möchte ich eine Übersicht aller Mitarbeiter sehen, um den Überblick zu behalten
- Als **Admin** möchte ich Mitarbeiter-Daten bearbeiten (Name, E-Mail), um Änderungen zu pflegen
- Als **Admin** möchte ich Mitarbeiter-Accounts deaktivieren (statt löschen), um bei Austritt den Login zu sperren aber Daten zu behalten
- Als **Admin** möchte ich das Urlaubskontingent pro Mitarbeiter festlegen, um die verfügbaren Urlaubstage zu definieren
- Als **Admin** möchte ich einen Initial-Admin-Account haben, um nach der ersten Installation das System einrichten zu können

## Acceptance Criteria

### User-Liste
- [ ] Übersicht aller Mitarbeiter in einer Tabelle/Liste
- [ ] Anzeige: Name, E-Mail, Rolle (Mitarbeiter/Admin), Status (Aktiv/Deaktiviert), Urlaubskontingent
- [ ] Suchfunktion nach Name oder E-Mail
- [ ] Sortierung nach Name, E-Mail, Status

### User erstellen
- [ ] "Neuer Mitarbeiter" Button öffnet Formular
- [ ] Formular-Felder:
  - Vorname (Pflichtfeld)
  - Nachname (Pflichtfeld)
  - E-Mail (Pflichtfeld, Format-Validierung)
  - Rolle (Dropdown: Mitarbeiter / Admin)
  - Initial-Passwort (Pflichtfeld, min. 8 Zeichen)
  - Urlaubskontingent (Zahl, z.B. 30 Tage/Jahr)
- [ ] "Speichern" Button erstellt User-Account
- [ ] Success Message: "Mitarbeiter [Name] wurde erfolgreich angelegt"
- [ ] Weiterleitung zur User-Liste

### User bearbeiten
- [ ] "Bearbeiten" Button bei jedem User
- [ ] Bearbeiten-Formular mit vorausgefüllten Daten
- [ ] Editierbare Felder: Vorname, Nachname, E-Mail, Rolle, Urlaubskontingent
- [ ] Passwort-Änderung optional (leeres Feld = keine Änderung)
- [ ] "Speichern" Button aktualisiert User-Daten
- [ ] Success Message: "Änderungen gespeichert"

### User deaktivieren/aktivieren
- [ ] "Deaktivieren" Button bei aktiven Usern
- [ ] Bestätigungs-Dialog: "Möchtest du [Name] wirklich deaktivieren? Der Login wird gesperrt, aber alle Daten bleiben erhalten."
- [ ] Nach Bestätigung: Status → Deaktiviert
- [ ] Deaktivierte User können sich nicht mehr einloggen
- [ ] "Aktivieren" Button bei deaktivierten Usern (reaktiviert Account)

### Initial Admin
- [ ] Bei erster Installation: Automatisch Admin-Account anlegen
- [ ] Initial-Credentials:
  - E-Mail: admin@hofzeit.local (oder über ENV konfigurierbar)
  - Passwort: muss bei erster Anmeldung geändert werden
- [ ] Hinweis in Dokumentation auf Initial-Credentials

### UX/UI
- [ ] Mobile-optimiert (responsive Tabelle/Cards)
- [ ] Loading-State bei User-Operationen
- [ ] Moderne, übersichtliche UI mit smooth Animationen
- [ ] Validierungs-Fehler werden inline im Formular angezeigt

## Edge Cases

### Doppelte E-Mail
- **Was passiert, wenn ein Admin eine E-Mail anlegt, die bereits existiert?**
  - Error Message: "Diese E-Mail wird bereits verwendet"
  - Formular bleibt geöffnet mit Fehler-Highlighting

### Admin deaktivieren
- **Kann ein Admin sich selbst deaktivieren?**
  - Nein, Error Message: "Du kannst deinen eigenen Account nicht deaktivieren"

- **Was passiert, wenn der letzte Admin deaktiviert werden soll?**
  - Error Message: "Es muss mindestens ein aktiver Admin existieren"

### User mit Zeiterfassungen löschen
- **Werden User physisch gelöscht oder nur deaktiviert?**
  - Nur deaktiviert (Soft Delete)
  - Alle Zeiterfassungen bleiben erhalten und sind dem User zugeordnet
  - Begründung: Compliance & Historie für Prüfstelle

### Urlaubskontingent nachträglich ändern
- **Was passiert mit bereits erfassten Urlaubstagen, wenn das Kontingent reduziert wird?**
  - System erlaubt die Änderung
  - Warnung: "Achtung: [Name] hat bereits 20 Urlaubstage erfasst, aber neues Kontingent ist nur 15 Tage"
  - Admin entscheidet, keine automatische Korrektur

### Passwort-Sicherheit
- **Welche Passwort-Anforderungen gibt es?**
  - Mindestens 8 Zeichen
  - Keine weiteren Complexity-Requirements (z.B. Sonderzeichen) für MVP
  - Passwort wird gehasht gespeichert

### Initial-Passwort
- **Wie erhält der Mitarbeiter sein Initial-Passwort?**
  - Admin übermittelt manuell (z.B. per Telefon, Brief)
  - Keine automatische E-Mail im MVP (kann später ergänzt werden)

## Technische Anforderungen

### Performance
- User-Liste lädt < 500ms (auch bei 100+ Usern)
- User-Operationen (Create/Update) < 300ms

### Security
- Nur Admin-Rolle hat Zugriff auf diese Funktionen
- Nicht-Admins werden zu 403-Error-Page weitergeleitet

### Datenbank
- User haben Status-Flag: aktiv/deaktiviert (Boolean)
- Soft Delete (keine physische Löschung)

## Abhängigkeiten
- **Benötigt:** PROJ-1 (User Authentication) - für Admin-Login und Rollen-Check

## Hinweise für Implementierung
- Passwort-Reset-Funktion ist nicht Teil dieses Features
- E-Mail-Versand (z.B. "Dein Account wurde erstellt") ist optional für MVP
- User-Import (CSV/Excel) kann später ergänzt werden
