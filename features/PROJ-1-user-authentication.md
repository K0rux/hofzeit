# PROJ-1: User Authentication

## Status: 🔵 Planned

## Überblick
Login-System für Mitarbeiter und Admins der "HofZeit" Zeiterfassungs-App. Authentifizierung erfolgt mit E-Mail und Passwort. Inkl. Passwort-Reset und "Angemeldet bleiben" Funktionalität.

## User Stories

- Als **Mitarbeiter** möchte ich mich mit meiner E-Mail und Passwort einloggen, um meine Zeiterfassungen zu verwalten
- Als **Admin** möchte ich mich mit meiner E-Mail und Passwort einloggen, um das Admin-Portal zu nutzen
- Als **eingeloggter User** möchte ich ausgeloggt werden können, um die Session zu beenden
- Als **User** möchte ich nach einem Browser-Reload eingeloggt bleiben, um nicht bei jedem Besuch neu einloggen zu müssen
- Als **User** möchte ich "Angemeldet bleiben" aktivieren können, um auch nach 30 Tagen noch eingeloggt zu bleiben
- Als **User** möchte ich mein Passwort zurücksetzen können, wenn ich es vergessen habe
- Als **System** möchte ich zwischen "Mitarbeiter" und "Admin" Rollen unterscheiden, um unterschiedliche Berechtigungen zu ermöglichen

## Acceptance Criteria

### Login
- [ ] Login-Formular mit E-Mail und Passwort-Feldern
- [ ] "Angemeldet bleiben" Checkbox (optional, standardmäßig nicht aktiviert)
- [ ] "Login" Button führt zur Authentifizierung
- [ ] "Passwort vergessen?" Link unterhalb des Login-Formulars
- [ ] Bei erfolgreicher Authentifizierung: Weiterleitung zur entsprechenden Startseite (Mitarbeiter → Dashboard, Admin → Admin-Portal)
- [ ] Bei falschen Credentials: Error Message "E-Mail oder Passwort falsch"
- [ ] Session bleibt nach Browser-Reload erhalten (Token-basiert)
- [ ] Passwort-Feld ist maskiert (type="password")
- [ ] Passwort-Sichtbarkeit Toggle (👁️ Icon zum Ein-/Ausblenden des Passworts)

### "Angemeldet bleiben" Funktion
- [ ] Checkbox "Angemeldet bleiben" im Login-Formular
- [ ] Wenn aktiviert: Session-Token Gültigkeit = 30 Tage
- [ ] Wenn nicht aktiviert: Session-Token Gültigkeit = 7 Tage (Standard)
- [ ] Token wird in Secure Cookie mit entsprechender Expiry gespeichert
- [ ] User bleibt auch nach Browser-Neustart eingeloggt
- [ ] Hinweis-Text bei Checkbox: "Du bleibst 30 Tage angemeldet"

### Passwort-Reset
- [ ] "Passwort vergessen?" Link auf Login-Seite
- [ ] Klick öffnet "Passwort zurücksetzen" Formular
- [ ] Formular-Feld: E-Mail (Pflichtfeld)
- [ ] "Link senden" Button sendet Reset-E-Mail
- [ ] Success Message: "Falls ein Account mit dieser E-Mail existiert, haben wir dir einen Link zum Zurücksetzen geschickt"
- [ ] Reset-E-Mail enthält:
  - Sicherer Reset-Link mit Token (Gültigkeit: 1 Stunde)
  - Hinweis: "Link ist 1 Stunde gültig"
  - Absender: noreply@hofzeit.app (oder konfigurierbar)
- [ ] Klick auf Reset-Link öffnet "Neues Passwort setzen" Seite
- [ ] Formular-Felder:
  - Neues Passwort (Pflichtfeld, min. 8 Zeichen)
  - Passwort wiederholen (Pflichtfeld, muss identisch sein)
  - Passwort-Stärke-Anzeige (schwach/mittel/stark)
- [ ] "Passwort ändern" Button setzt neues Passwort
- [ ] Success Message: "Passwort wurde erfolgreich geändert. Du kannst dich jetzt einloggen."
- [ ] Weiterleitung zur Login-Seite nach 3 Sekunden

### Logout
- [ ] "Logout" Button in Navigation verfügbar
- [ ] Logout beendet Session und leitet zur Login-Seite weiter
- [ ] Nach Logout: Zugriff auf geschützte Routen führt zur Login-Seite

### Rollen-System
- [ ] User hat eine Rolle: "Mitarbeiter" oder "Admin"
- [ ] Nach Login wird User zur entsprechenden Startseite weitergeleitet basierend auf Rolle
- [ ] Admin-Routen sind nur für Admins zugänglich
- [ ] Mitarbeiter-Routen sind für beide Rollen zugänglich

### Security
- [ ] Passwörter werden gehasht gespeichert (niemals Plaintext)
- [ ] Login-Versuche sind rate-limited (z.B. max 5 Versuche pro Minute pro IP)
- [ ] Session-Tokens haben eine Gültigkeitsdauer:
  - Standard: 7 Tage
  - Mit "Angemeldet bleiben": 30 Tage
- [ ] Reset-Tokens sind einmalig verwendbar (nach Nutzung ungültig)
- [ ] Reset-Tokens haben kurze Gültigkeit (1 Stunde)
- [ ] Reset-Token wird nach erfolgreicher Passwort-Änderung invalidiert
- [ ] E-Mail-Versand ist rate-limited (max. 3 Reset-E-Mails pro 15 Minuten pro Account)

### UX/UI
- [ ] Mobile-optimiert (PWA-ready)
- [ ] Loading-State während Login-Request
- [ ] Moderne, übersichtliche UI mit smooth Animationen
- [ ] Error Messages sind klar und verständlich

## Edge Cases

### Login-Fehler
- **Was passiert bei 5 falschen Login-Versuchen?**
  - Temporäre Sperre für 5 Minuten
  - Error Message: "Zu viele fehlgeschlagene Versuche. Bitte versuche es in 5 Minuten erneut."

### Session-Handling
- **Was passiert, wenn der Session-Token abgelaufen ist?**
  - User wird automatisch ausgeloggt
  - Weiterleitung zur Login-Seite mit Message: "Deine Session ist abgelaufen. Bitte logge dich erneut ein."

### Account-Status
- **Was passiert, wenn der Admin einen User-Account deaktiviert hat?**
  - Login schlägt fehl mit Message: "Dein Account wurde deaktiviert. Bitte kontaktiere den Administrator."

### Netzwerk-Fehler
- **Was passiert bei fehlender Internet-Verbindung?**
  - Error Message: "Keine Verbindung zum Server. Bitte prüfe deine Internet-Verbindung."

### Doppelter Login
- **Kann ein User gleichzeitig auf mehreren Geräten eingeloggt sein?**
  - Ja, mehrere Sessions sind erlaubt (praktisch für Desktop + Mobile)

### Passwort-Reset Edge Cases
- **Was passiert bei mehrfachem Klick auf "Link senden"?**
  - Rate Limiting: Max. 3 E-Mails pro 15 Minuten
  - Nach 3. Versuch: Error Message "Zu viele Anfragen. Bitte warte 15 Minuten."

- **Was passiert, wenn User nicht existiert?**
  - Gleiche Success Message wie bei existierendem User (verhindert User-Enumeration)
  - Keine E-Mail wird versendet

- **Was passiert, wenn Reset-Token abgelaufen ist (> 1 Stunde)?**
  - Error Message: "Dieser Link ist abgelaufen. Bitte fordere einen neuen Link an."
  - Link zur Passwort-Reset-Seite angezeigt

- **Was passiert, wenn Reset-Token bereits verwendet wurde?**
  - Error Message: "Dieser Link wurde bereits verwendet. Bitte fordere einen neuen Link an."

- **Was passiert bei falschem/ungültigem Reset-Token?**
  - Error Message: "Ungültiger Link. Bitte fordere einen neuen Link an."

- **Was passiert, wenn neues Passwort = altes Passwort?**
  - Erlaubt, aber Warnung: "Dein neues Passwort sollte sich vom alten unterscheiden"

- **Was passiert, wenn "Passwort wiederholen" nicht übereinstimmt?**
  - Error Message: "Passwörter stimmen nicht überein"
  - Beide Felder rot markiert

### "Angemeldet bleiben" Edge Cases
- **Was passiert beim Logout mit aktiviertem "Angemeldet bleiben"?**
  - Session wird vollständig beendet (Cookie gelöscht)
  - User muss sich neu einloggen (auch wenn 30-Tage-Token noch gültig wäre)

- **Kann User "Angemeldet bleiben" nachträglich aktivieren?**
  - Nein, nur beim Login
  - Alternative: User muss sich neu einloggen und Checkbox aktivieren

## Technische Anforderungen

### Performance
- Login-Response < 500ms
- Session-Validation < 100ms
- Passwort-Reset E-Mail-Versand < 2 Sekunden

### Security
- HTTPS only (keine HTTP-Verbindungen)
- Secure Cookies für Session-Tokens (HttpOnly, SameSite=Strict)
- CSRF-Protection aktiviert
- Reset-Tokens kryptographisch sicher generiert (z.B. UUID v4)
- Passwort-Hashing mit bcrypt oder Argon2

### E-Mail-Versand
- SMTP-Server konfigurierbar (ENV-Variablen)
- E-Mail-Template für Passwort-Reset
- HTML + Plain-Text Version der E-Mail
- Fallback: Bei E-Mail-Fehler wird Error geloggt, aber User sieht Success Message (Security)

### Mobile (PWA)
- Touch-optimierte Buttons (min. 44x44px)
- Responsive Design (Breakpoints: mobile, tablet, desktop)
- Passwort-Sichtbarkeit-Toggle (👁️ Icon) touch-optimiert

## Abhängigkeiten
- Keine (Basis-Feature)

## Hinweise für Implementierung
- **E-Mail-Provider:** SMTP-Server muss konfiguriert sein (z.B. SendGrid, AWS SES, oder Self-Hosted)
- **E-Mail-Templates:** Verwende HTML-Templates für professionelles Design
- **Reset-Token-Storage:** In Datenbank mit Expiry-Timestamp speichern
- **Session-Management:** JWT oder Server-side Sessions (z.B. mit Redis)
- **Passwort-Stärke:** Client-seitige Validierung + Server-seitige Validierung
- **E-Mail-Verifizierung:** Ist **nicht** Teil dieses Features (kann später ergänzt werden)
- **User-Accounts:** Werden vom Admin erstellt (siehe PROJ-2)
