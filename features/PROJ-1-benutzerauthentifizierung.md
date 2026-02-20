# PROJ-1: Benutzerauthentifizierung

## Status: Deployed
**Created:** 2026-02-20
**Last Updated:** 2026-02-20 (all QA bugs fixed, ready for /deploy)

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

**Tested:** 2026-02-20
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)
**Build Status:** PASS (Next.js 16.1.6 Turbopack, compiles without errors)
**Lint Status:** FAIL (see BUG-2)

### Acceptance Criteria Status

#### AC-1: Login-Formular mit E-Mail und Passwort
- [x] E-Mail-Feld vorhanden (`type="email"`, `id="email"`, Label "E-Mail-Adresse")
- [x] Passwort-Feld vorhanden (`type="password"`, `id="password"`, Label "Passwort")
- [x] Anmelden-Button vorhanden mit Ladezustand ("Anmelden..." während Request)

#### AC-2: Weiterleitung bei korrekten Zugangsdaten
- [x] `supabase.auth.signInWithPassword()` korrekt implementiert
- [x] Nach erfolgreichem Login: `window.location.href = '/dashboard'` (PWA-kompatibel)
- [x] `data.session` wird geprüft bevor Redirect erfolgt

#### AC-3: Fehlermeldung bei falschen Zugangsdaten
- [x] Deutsche Fehlermeldung: "E-Mail oder Passwort ist falsch."
- [x] Catch-Block für unerwartete Fehler: "Ein unerwarteter Fehler ist aufgetreten..."
- [x] Fehler wird per `role="alert"` für Screenreader angekündigt

#### AC-4: Logout-Button im App-Header
- [x] "Abmelden"-Button im Header von AppLayout vorhanden
- [x] Button hat Ladezustand ("Abmelden...")
- [x] E-Mail des eingeloggten Nutzers wird angezeigt (nur ab `sm` Breakpoint, siehe BUG-5)

#### AC-5: Redirect nach Logout zur Login-Seite
- [x] `supabase.auth.signOut()` wird aufgerufen
- [x] `window.location.href = '/login'` nach Logout (PWA-kompatibel)

#### AC-6: Sitzung bleibt nach App-Neustart erhalten
- [x] `@supabase/ssr` für Cookie-basierte Session-Verwaltung
- [x] Server-Client, Browser-Client und Middleware-Client korrekt konfiguriert
- [x] Middleware refreshed Session bei jedem Request

#### AC-7: Mobile Nutzbarkeit (375px)
- [x] Login-Card: `w-full max-w-sm` mit `px-4` Padding
- [x] Full-screen centered Layout: `min-h-screen items-center justify-center`
- [x] Button: `w-full` für volle Breite

#### AC-8: Passwörter niemals im Klartext
- [x] Supabase Auth verwaltet Passwort-Hashing serverseitig (bcrypt)
- [x] Keine lokale Passwort-Speicherung im Code
- [x] `autoComplete="current-password"` für Browser-Passwort-Manager

#### AC-9: Nicht eingeloggte Nutzer werden umgeleitet
- [x] Middleware prüft `supabase.auth.getUser()` bei jedem Request
- [x] Ohne User: Redirect zu `/login`
- [x] `/` Seite redirected zu `/dashboard` (und damit durch Middleware geschützt)
- [x] Eingeloggt + auf `/login`: Redirect zu `/dashboard`

#### AC-10: Barrierefreiheit / ARIA
- [x] `<Label htmlFor="email">` und `<Label htmlFor="password">` verknüpft
- [x] `aria-describedby` verweist auf Fehlermeldung wenn vorhanden
- [x] Fehlermeldung hat `role="alert"`
- [x] `<html lang="de">` korrekt gesetzt

### Edge Cases Status

#### EC-1: Mehrfach falsche Passwortversuche
- [x] Fehlermeldung wird bei jedem Versuch angezeigt
- [x] Kein automatisches Konto-Sperren (wie in Spec definiert)
- [x] Supabase internes Rate-Limiting greift bei Missbrauch

#### EC-2: Sitzung läuft ab während App geöffnet
- [x] Middleware prüft Auth bei jedem Request via `getUser()`
- [x] Ungültige Sitzung: Redirect zu `/login`

#### EC-3: Ungültiges E-Mail-Format
- [x] `type="email"` + `required` ermöglicht Browser-Validierung
- [x] Supabase validiert serverseitig zusätzlich

#### EC-4: Deaktivierter Nutzer während eingeloggt
- [x] `getUser()` in Middleware schlägt fehl bei deaktiviertem User
- [x] User wird bei nächstem Request zu `/login` umgeleitet

### Security Audit Results

- [x] **Auth Bypass:** Middleware schützt alle Routen korrekt; kein Weg an Auth vorbei
- [x] **Route Protection:** Alle nicht-öffentlichen Routen geschützt; `/` leitet zu `/dashboard` weiter
- [x] **XSS:** React-Escaping aktiv; kein `dangerouslySetInnerHTML`; Inputs sind kontrollierte Komponenten
- [x] **CSRF:** Supabase Auth nutzt Token-basierte Auth, nicht anfällig für CSRF
- [x] **Session Management:** `@supabase/ssr` verwaltet Cookies sicher; Session-Refresh in Middleware
- [x] **Exposed Secrets:** Nur `NEXT_PUBLIC_*` Variablen im Browser-Client (designed to be public)
- [x] **Session Fixation:** Supabase verwaltet Session-IDs serverseitig
- [ ] **BUG: Security Headers fehlen** (siehe BUG-3)
- [ ] **BUG: `.env.local.example` fehlt** (siehe BUG-1)

### Bugs Found

#### BUG-1: `.env.local.example` Datei fehlt
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Suche nach `.env.local.example` im Projekt
  2. Expected: Datei existiert mit Dummy-Werten für `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  3. Actual: Datei existiert nicht
- **Impact:** Neue Entwickler wissen nicht, welche Umgebungsvariablen benötigt werden
- **Priority:** Fix before deployment

#### BUG-2: ESLint (`npm run lint`) schlägt fehl
- **Severity:** Medium
- **Steps to Reproduce:**
  1. `npm run lint` ausführen
  2. Expected: Lint-Check läuft durch
  3. Actual: "Invalid project directory provided, no such directory: ...\\lint"
- **Impact:** Code-Qualität kann nicht automatisch geprüft werden
- **Priority:** Fix before deployment

#### BUG-3: Security Headers fehlen in `next.config.ts`
- **Severity:** High
- **Steps to Reproduce:**
  1. Öffne `next.config.ts`
  2. Expected: Security Headers konfiguriert (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Strict-Transport-Security)
  3. Actual: Leere Config ohne Headers
- **Impact:** App ist anfällig für Clickjacking, MIME-Sniffing und andere Angriffe
- **Priority:** Fix before deployment

#### BUG-4: Deprecated Middleware Convention (Next.js 16)
- **Severity:** Low
- **Steps to Reproduce:**
  1. `npm run build` ausführen
  2. Warning: "The 'middleware' file convention is deprecated. Please use 'proxy' instead."
- **Impact:** Funktioniert aktuell noch, aber wird in zukünftigen Next.js Versionen entfernt
- **Priority:** Fix in next sprint

#### BUG-5: Benutzer-E-Mail auf Mobile nicht sichtbar
- **Severity:** Low
- **Steps to Reproduce:**
  1. App auf 375px Breite öffnen
  2. Expected: Nutzer sieht, mit welchem Account er eingeloggt ist
  3. Actual: E-Mail ist `hidden sm:inline` und auf Mobile ausgeblendet
- **Impact:** Nutzer kann auf Mobile nicht sehen, als wer er eingeloggt ist
- **Priority:** Nice to have

#### BUG-6: Unbenutzter Import `useRouter` in AppLayout
- **Severity:** Low
- **Steps to Reproduce:**
  1. Öffne `src/components/app-layout.tsx`
  2. Zeile 3: `import { useRouter } from 'next/navigation'`
  3. Variable `router` wird deklariert aber nie verwendet
- **Impact:** Dead Code, kein funktionaler Impact
- **Priority:** Nice to have

### Summary
- **Acceptance Criteria:** 10/10 passed
- **Edge Cases:** 4/4 passed
- **Bugs Found:** 6 total (0 critical, 1 high, 2 medium, 3 low) — **all fixed**
- **Security:** PASS (Security Headers added)
- **Production Ready:** YES
- **Recommendation:** All bugs fixed. Ready for `/deploy`.

### Bug Fix Status
| Bug | Status | Fix |
|-----|--------|-----|
| BUG-1: `.env.local.example` fehlt | ✅ Fixed | Datei erstellt mit Dummy-Werten |
| BUG-2: ESLint schlägt fehl | ✅ Fixed | `eslint.config.mjs` (flat config) erstellt, `package.json` auf `eslint .` aktualisiert |
| BUG-3: Security Headers fehlen | ✅ Fixed | Security Headers in `next.config.ts` konfiguriert |
| BUG-4: Deprecated Middleware | ✅ Fixed | `src/middleware.ts` → `src/proxy.ts` umbenannt |
| BUG-5: E-Mail auf Mobile nicht sichtbar | ✅ Fixed | `hidden sm:inline` → `max-w-[140px] truncate` |
| BUG-6: Unbenutzter `useRouter` Import | ✅ Fixed | Import und Variable entfernt |

## Deployment

**Deployed:** 2026-02-20
**Production URL:** https://hofzeit.vercel.app/
**Platform:** Vercel (auto-deploy from `main` branch)
**Git Tag:** v1.0.0-PROJ-1
