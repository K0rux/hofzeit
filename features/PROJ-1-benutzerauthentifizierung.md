# PROJ-1: Benutzerauthentifizierung

## Status: In Progress
**Created:** 2026-02-20
**Last Updated:** 2026-02-20

## Dependencies
- Keine

## Beschreibung
Mitarbeiter und Administratoren können sich mit ihrer E-Mail-Adresse und einem Passwort in Hofzeit einloggen. Das System verwaltet Sitzungen sicher und ermöglicht das Ausloggen. Das Design ist für mobile Nutzung (iPhone/PWA) optimiert.

## User Stories
- Als Mitarbeiter möchte ich mich mit meiner E-Mail und meinem Passwort einloggen, damit ich auf meine persönlichen Zeiterfassungsdaten zugreifen kann.
- Als Mitarbeiter möchte ich mich ausloggen, damit meine Daten auf dem Gerät geschützt sind (besonders bei geteilten Geräten).
- Als Admin möchte ich, dass nur registrierte Benutzer Zugang zur App haben, damit keine unbefugten Personen Daten einsehen oder ändern.
- Als Mitarbeiter möchte ich, dass meine Sitzung auf dem Gerät gespeichert bleibt, damit ich mich nicht bei jedem App-Aufruf neu einloggen muss.
- Als Mitarbeiter mit vergessenem Passwort möchte ich den Admin kontaktieren können, um ein neues Passwort zu erhalten.

## Acceptance Criteria
- [ ] Ein Loginformular mit E-Mail-Feld und Passwortfeld wird angezeigt
- [ ] Bei korrekten Zugangsdaten wird der Nutzer zur Hauptseite weitergeleitet
- [ ] Bei falschen Zugangsdaten wird eine verständliche Fehlermeldung auf Deutsch angezeigt
- [ ] Ein Logout-Button ist im App-Header jederzeit erreichbar
- [ ] Nach dem Logout wird der Nutzer zur Loginseite umgeleitet
- [ ] Die Sitzung bleibt nach App-Neustart erhalten (kein erneutes Login nötig)
- [ ] Die Loginseite ist auf Mobilgeräten (375px Breite) vollständig nutzbar
- [ ] Passwörter werden niemals im Klartext gespeichert oder übertragen
- [ ] Nicht eingeloggte Nutzer werden automatisch zur Loginseite weitergeleitet
- [ ] Eingabefelder sind klar beschriftet (Barrierefreiheit/ARIA)

## Edge Cases
- Was passiert bei mehrfach falschen Passwortversuchen? → Fehlermeldung nach jedem Versuch; kein automatisches Konto-Sperren in MVP (Admin kann Passwort zurücksetzen)
- Was passiert, wenn die Sitzung abläuft während der Nutzer die App geöffnet hat? → Nutzer wird beim nächsten API-Aufruf automatisch zur Loginseite umgeleitet
- Was passiert bei fehlendem/ungültigem E-Mail-Format? → Inline-Validierung mit Hinweis
- Was passiert, wenn der Nutzer deaktiviert wurde während er eingeloggt war? → Sitzung wird ungültig, Nutzer wird ausgeloggt

## Technical Requirements
- Sicherheit: HTTPS erzwingen (keine unverschlüsselte Übertragung)
- DSGVO: Keine Tracking-Cookies, Sitzungsdaten nur für Authentifizierung
- PWA: Login-Seite muss auch als PWA korrekt funktionieren (kein Redirect-Loop)
- Performance: Login-Response < 2 Sekunden

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Komponentenstruktur

```
/login  (öffentliche Seite)
└── LoginPage
    └── LoginForm
        ├── E-Mail-Eingabe
        ├── Passwort-Eingabe
        ├── Anmelden-Button (mit Ladezustand)
        └── Fehler-Meldung (deutsch, z.B. "E-Mail oder Passwort falsch")

Alle geschützten Seiten
└── AppLayout (Rahmen)
    ├── Header
    │   ├── "Hofzeit" Logo / Titel
    │   ├── Eingeloggter Nutzer (E-Mail)
    │   └── Abmelden-Button
    └── Seiteninhalt (Platzhalter für alle anderen Features)

Routenwächter (unsichtbar, läuft vor dem Seitenaufbau)
├── Nicht eingeloggt → Weiterleitung zu /login
└── Bereits eingeloggt + besucht /login → Weiterleitung zu /dashboard
```

### Datenspeicherung

Supabase verwaltet die Authentifizierung automatisch:

- **Benutzerkonto** (von Supabase verwaltet): E-Mail-Adresse (eindeutig), Passwort (nur als sicherer Hash), eindeutige Nutzer-ID
- **Sitzung** (im Browser gespeichert): Login-Token wird sicher im Browser-Speicher des Geräts abgelegt; Supabase verwaltet das automatisch; Sitzung bleibt nach App-Neustart erhalten
- Keine eigenen Datenbanktabellen in PROJ-1 nötig; Nutzerprofile mit Rollen (Mitarbeiter/Admin) kommen in PROJ-2

### Seitenstruktur

| Route | Sichtbarkeit | Beschreibung |
|---|---|---|
| `/login` | Öffentlich | Login-Formular |
| `/dashboard` | Geschützt | Hauptseite nach Login |
| Alle anderen Routen | Geschützt | Weiterleitung zu `/login` wenn nicht eingeloggt |

### Technische Entscheidungen

| Entscheidung | Warum |
|---|---|
| **Supabase Auth** (E-Mail + Passwort) | Bereits im Stack, kein externes Service nötig. Passwörter werden automatisch sicher gespeichert. |
| **Next.js Middleware** für Routenschutz | Läuft serverseitig vor dem Seitenaufbau. Nutzer sehen keine geschützten Inhalte, bevor die Auth-Prüfung abgeschlossen ist. |
| **Supabase JS Client** | Verwaltet Sitzung automatisch im Browser-Speicher. Sitzung bleibt nach Neustart erhalten. |
| **`window.location.href`** für Weiterleitung nach Login | Verhindert Redirect-Loops in der PWA (bekanntes Problem mit `router.push` in Supabase+Next.js). |

### Neue Pakete

Keine – Supabase-JS ist bereits im Stack enthalten.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
