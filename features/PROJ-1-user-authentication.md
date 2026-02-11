# PROJ-1: User Authentication

## Status: 🔄 Ready for QA Re-Testing (All Bugs Fixed)

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

---

## Tech-Design (Solution Architect)

### Component-Struktur

```
Login-Seite (/login)
├── Login-Formular-Card
│   ├── E-Mail Eingabefeld
│   ├── Passwort Eingabefeld (mit Sichtbarkeit-Toggle 👁️)
│   ├── "Angemeldet bleiben" Checkbox
│   ├── "Login" Button (mit Loading-Animation)
│   └── "Passwort vergessen?" Link
└── HofZeit Logo (oben)

Passwort-Reset-Seite (/reset-password)
├── E-Mail-Anforderungs-Formular
│   ├── E-Mail Eingabefeld
│   ├── "Link senden" Button
│   └── "Zurück zum Login" Link
└── Success-Message (nach Absenden)

Neues-Passwort-Setzen-Seite (/reset-password/confirm)
├── Passwort-Formular-Card
│   ├── "Neues Passwort" Eingabefeld
│   ├── "Passwort wiederholen" Eingabefeld
│   ├── Passwort-Stärke-Anzeige (Farbbalken: rot/gelb/grün)
│   ├── "Passwort ändern" Button
│   └── Ablauf-Warnung (wenn Token fast abgelaufen)
└── Auto-Redirect nach Success (3 Sekunden)

Navigation (nach Login)
└── "Logout" Button (oben rechts)

Geschützte Routen
├── Middleware prüft Session automatisch
├── Weiterleitung zu /login wenn nicht authentifiziert
└── Rollen-basierte Weiterleitung nach Login
    ├── Mitarbeiter → /dashboard
    └── Admin → /admin
```

### Daten-Model

**PostgreSQL Tabellen-Struktur (vereinfacht beschrieben):**

**Users Tabelle**
- Eindeutige User-ID (UUID, automatisch generiert)
- E-Mail-Adresse (eindeutig, nicht duplizierbar)
- Passwort-Hash (niemals Klartext!)
- Rolle: "mitarbeiter" oder "admin"
- Account-Status: "aktiv" oder "deaktiviert"
- Erstellungsdatum
- Letzter Login-Zeitpunkt
- Letzte Passwort-Änderung

**Password_Reset_Tokens Tabelle**
- Token-ID (UUID)
- User-ID (Verknüpfung zu Users)
- Token-String (zufällig generiert, sehr lang)
- Erstellungszeitpunkt
- Ablaufzeitpunkt (1 Stunde nach Erstellung)
- Verwendet: Ja/Nein (Token kann nur 1x genutzt werden)

**Login_Attempts Tabelle (für Rate-Limiting)**
- IP-Adresse
- User-E-Mail (falls angegeben)
- Zeitpunkt des Versuchs
- Erfolgreich: Ja/Nein
- Automatische Löschung nach 24 Stunden

**Sessions**
- Gespeichert als JWT-Token im Browser-Cookie
- JWT enthält: User-ID, Rolle, Ablaufzeitpunkt
- Keine Session-Tabelle nötig (JWT ist selbst-validierend)

### Backend-Infrastruktur

**PostgreSQL Datenbank**
- Direkte Verbindung zu PostgreSQL Server
- Connection Pool für Performance
- Migrations-System für Datenbank-Schema-Updates

**Next.js API Routes (Backend-Endpunkte)**
```
/api/auth/login
→ Prüft E-Mail + Passwort
→ Erstellt JWT-Token
→ Setzt Session-Cookie

/api/auth/logout
→ Löscht Session-Cookie
→ Invalidiert Token

/api/auth/me
→ Gibt aktuellen User zurück (für Session-Check)

/api/auth/reset-password
→ Erstellt Reset-Token
→ Sendet E-Mail

/api/auth/reset-password/confirm
→ Prüft Reset-Token
→ Setzt neues Passwort
```

**Middleware (Route-Protection)**
- Läuft vor jeder Anfrage
- Prüft JWT-Token im Cookie
- Prüft Rollen-Berechtigung für Route
- Automatische Weiterleitung zu /login wenn nicht authentifiziert

### Tech-Entscheidungen (Begründung)

#### Warum PostgreSQL statt Supabase?
✅ **Volle Kontrolle:** Eigenes Datenbank-Schema
✅ **Keine Vendor-Lock-In:** Kann auf jeden PostgreSQL-Server deployed werden
✅ **Flexibilität:** Custom Auth-Logik möglich

#### Warum JWT für Sessions?
✅ **Stateless:** Kein Session-Speicher nötig (Redis nicht erforderlich)
✅ **Schnell:** Session-Validierung ohne Datenbank-Abfrage (< 100ms)
✅ **Skalierbar:** Funktioniert auf mehreren Servern ohne Sync-Problem
✅ **Secure:** HttpOnly Cookie verhindert JavaScript-Zugriff

#### Warum bcrypt für Passwort-Hashing?
✅ **Industrie-Standard:** Bewährt seit Jahren
✅ **Brute-Force-Schutz:** Langsam genug, um Angriffe zu verlangsamen
✅ **Salting eingebaut:** Jedes Passwort hat eigenen Salt

#### Warum Resend für E-Mail-Versand?
✅ **Modern & Einfach:** Bessere API als SendGrid/AWS SES
✅ **React-Email-Support:** E-Mail-Templates mit React-Komponenten
✅ **Free-Tier:** 100 E-Mails/Tag kostenlos (ausreichend für MVP)
✅ **TypeScript-First:** Gute Developer Experience

#### Warum Drizzle ORM statt Prisma?
✅ **Leichtgewichtig:** Kleinere Bundle-Size
✅ **SQL-näher:** Mehr Kontrolle über Queries
✅ **TypeScript-Native:** Bessere Type-Safety
✅ **Schneller:** Weniger Overhead als Prisma

#### Warum next-auth NICHT verwenden?
❌ **Zu umfangreich:** Wir brauchen nur E-Mail/Passwort-Login
❌ **OAuth-Overhead:** Wir nutzen kein Google/GitHub-Login
❌ **Komplexe Konfiguration:** Mehr Code als nötig

### Session-Management

**"Angemeldet bleiben" Logik**
- Checkbox aktiviert → JWT-Token mit TTL = 30 Tage
- Checkbox deaktiviert → JWT-Token mit TTL = 7 Tage
- Cookie mit gleicher Expiry wie Token

**JWT-Token Struktur**
```
{
  userId: "uuid",
  email: "user@example.com",
  role: "mitarbeiter" oder "admin",
  iat: Erstellungszeitpunkt,
  exp: Ablaufzeitpunkt
}
```

**Logout-Mechanik**
- Cookie wird gelöscht (Browser vergisst Token)
- Kein Server-Side Invalidieren nötig (JWT läuft einfach ab)

**Session-Refresh**
- Kein automatisches Refresh (User muss neu einloggen nach Ablauf)
- Alternative: Refresh-Token-System (optional, erhöht Komplexität)

### Rollen-System

**Rolle in Users-Tabelle gespeichert**
- Spalte: `role` (Text: "mitarbeiter" oder "admin")
- Bei User-Erstellung durch Admin wird Rolle gesetzt

**Routing-Logik nach Login**
1. User loggt sich ein
2. Backend liest User aus Datenbank (inkl. Rolle)
3. JWT enthält Rolle
4. Frontend liest JWT und leitet weiter:
   - Wenn "mitarbeiter" → `/dashboard`
   - Wenn "admin" → `/admin`

**Route-Protection**
- Next.js Middleware liest JWT aus Cookie
- Prüft: Ist Token gültig? (Signatur + Ablaufzeit)
- Prüft: Hat User die richtige Rolle?
- Admin-Routen: Nur für `role = "admin"`
- Mitarbeiter-Routen: Für beide Rollen

### Security-Features (Custom Implementation)

**Passwort-Hashing**
- bcrypt mit Cost-Factor 12 (Balance zwischen Sicherheit und Performance)
- Jedes Passwort hat eigenen Salt (automatisch)

**Rate-Limiting**
- Login: Max. 5 Versuche pro IP pro Minute
- Reset-E-Mail: Max. 3 Anfragen pro E-Mail pro 15 Minuten
- Implementierung: In-Memory-Cache (upstash/ratelimit oder eigene Lösung)
- Bei Überschreitung: 429 Error + 5 Minuten Sperre

**Cookie-Security**
```
HttpOnly: true (JavaScript kann nicht zugreifen)
Secure: true (nur HTTPS)
SameSite: "strict" (CSRF-Schutz)
Path: "/" (App-weit gültig)
```

**Reset-Token-Security**
- Token: Kryptographisch sicherer Zufallsstring (32 Bytes, hex-encoded)
- Gespeichert in Datenbank mit Ablaufzeit
- Nach Nutzung: `used = true` → Token ungültig
- Nach 1 Stunde: Token automatisch ungültig (Datenbank-Cleanup)

**SQL-Injection-Schutz**
- Drizzle ORM: Prepared Statements (automatisch)
- Keine String-Concatenation in Queries

### Dependencies

**Neue Dependencies die installiert werden müssen:**

**Datenbank & ORM**
- `drizzle-orm` - TypeScript-ORM für PostgreSQL
- `drizzle-kit` - Migrations-Tool
- `postgres` - PostgreSQL-Client (moderner als `pg`)

**Authentication**
- `bcryptjs` - Passwort-Hashing (JavaScript-Version, keine C++ Build nötig)
- `jose` - JWT-Signing und -Verifizierung (Edge-kompatibel)

**E-Mail-Versand**
- `resend` - E-Mail-API
- `react-email` - React-Komponenten für E-Mail-Templates
- `@react-email/components` - Vorgefertigte E-Mail-Komponenten

**Rate-Limiting**
- `@upstash/ratelimit` - Rate-Limiting (nutzt Vercel KV oder lokalen Cache)

**Validierung**
- `zod` - Schema-Validierung (bereits installiert ✅)

**Icons**
- `lucide-react` - Icons (bereits installiert ✅)

**UI-Components**
- shadcn/ui (bereits installiert ✅)

### Environment-Variablen (benötigt)

```
# PostgreSQL Verbindung
DATABASE_URL=postgresql://user:password@localhost:5432/hofzeit

# JWT Secret (random string, min. 32 Zeichen)
JWT_SECRET=super-geheimer-random-string-min-32-zeichen

# E-Mail (Resend)
RESEND_API_KEY=re_xxx

# App-URL (für E-Mail-Links)
NEXT_PUBLIC_APP_URL=https://hofzeit.app

# Optional: Rate-Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

### Mobile-Optimierung (PWA)

**Touch-Optimierung**
- Buttons: Min. 44x44px (shadcn/ui Standard)
- Passwort-Toggle Icon: Großer Touch-Target
- Formulare: Responsive Spacing

**Responsive Breakpoints**
- Mobile: < 768px (Stack-Layout)
- Tablet: 768px - 1024px
- Desktop: > 1024px (zentrierte Login-Card)

**PWA-Anforderungen**
- Offline-Fallback: "Keine Internet-Verbindung" Message
- Manifest.json: Login-Flow auch in Standalone-Mode
- Service Worker: Cached Assets für schnelleres Laden

### Performance-Ziele

- **Login-Response:** < 500ms (Datenbank-Query + JWT-Generierung)
- **Session-Validation:** < 100ms (JWT-Verifizierung ohne DB)
- **Passwort-Reset-E-Mail:** < 2 Sekunden (Resend API + DB-Insert)

### E-Mail-Templates

**Passwort-Reset-E-Mail**
- HTML-Version mit HofZeit-Branding
- Plain-Text-Fallback
- Großer "Passwort zurücksetzen" Button
- Hinweis: "Link ist 1 Stunde gültig"
- Footer: "Falls du das nicht warst, ignoriere diese E-Mail"

**E-Mail-Design mit react-email**
- React-Komponenten für E-Mail-Layout
- Automatische HTML + Plain-Text Generierung
- Preview im Browser während Entwicklung

### Edge Cases & Error-Handling

**Alle Edge Cases werden durch Custom-Code abgedeckt:**

✅ **Rate-Limiting:** @upstash/ratelimit
✅ **Token-Ablauf:** JWT `exp` Claim prüfen
✅ **Account-Deaktivierung:** `status = "deaktiviert"` in DB prüfen
✅ **Doppelter Login:** Mehrere JWT-Tokens erlaubt (verschiedene Geräte)
✅ **User-Enumeration-Schutz:** Gleiche Message bei existierend/nicht-existierend
✅ **Reset-Token-Sicherheit:** Token nach Nutzung invalidieren

---

## Zusammenfassung für Produkt-Manager

**Was wird gebaut?**
- 3 Seiten: Login, Passwort-Reset-Anforderung, Neues-Passwort-Setzen
- Session-Management mit JWT-Tokens
- "Angemeldet bleiben" Funktion (7 oder 30 Tage)
- Sicheres Passwort-Reset-System per E-Mail
- Eigenes Auth-System (kein Drittanbieter wie Supabase)

**Technische Highlights:**
- ✅ PostgreSQL Datenbank (volle Kontrolle)
- ✅ JWT für Sessions (schnell, skalierbar)
- ✅ bcrypt für Passwort-Hashing (Industrie-Standard)
- ✅ Resend für E-Mail-Versand (modern, einfach)
- ✅ Drizzle ORM für Type-Safe Datenbank-Queries
- ✅ Rate-Limiting gegen Brute-Force-Attacken
- ✅ Mobile-optimiert mit shadcn/ui

**Vorteile dieser Architektur:**
- Keine Vendor-Lock-In (kann auf jeden PostgreSQL-Server deployed werden)
- Volle Kontrolle über Auth-Logik
- Keine monatlichen Kosten für Auth-Service (nur E-Mail-Versand)
- Production-Ready Security (bcrypt, JWT, HttpOnly Cookies)

**Nächste Schritte:**
1. PostgreSQL Datenbank aufsetzen (lokal oder Cloud)
2. Dependencies installieren (siehe Liste oben)
3. Environment-Variablen konfigurieren
4. Resend Account erstellen + API-Key generieren
5. Frontend Developer implementiert UI + API Routes basierend auf diesem Design

---

**Design ist fertig! 🎉**

---

## QA Test Results

**Tested:** 2026-02-11
**App URL:** http://localhost:3000
**Tester:** QA Engineer Agent
**Test Type:** Comprehensive Manual Testing + Security Testing + Code Review

## CRITICAL FINDING: FEATURE IS NOT FUNCTIONAL

After thorough testing and code review, the feature is **NOT FUNCTIONAL** and cannot be tested properly because:

**BLOCKING ISSUE: Frontend is NOT connected to Backend**
- All 3 frontend pages (Login, Password Reset, Password Reset Confirm) contain `TODO` comments
- Frontend only **simulates** API calls (using `setTimeout`) instead of making actual requests
- Backend API routes are fully implemented but are **never called** by the frontend

**Evidence:**
- `src/app/login/page.tsx` Line 28-33: API call is commented out with TODO
- `src/app/reset-password/page.tsx` Line 25-30: API call is commented out with TODO
- `src/app/reset-password/confirm/page.tsx` Line 81-86: API call is commented out with TODO

## Code Review Findings

### Backend Implementation: COMPLETE
- All API routes implemented: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/reset-password`, `/api/auth/reset-password/confirm`
- Database schema properly defined with PostgreSQL + Drizzle ORM
- JWT-based session management implemented
- Rate limiting implemented (in-memory fallback for dev)
- Password hashing with bcryptjs
- Middleware for route protection implemented
- Security features: HttpOnly cookies, role-based access control

### Frontend Implementation: INCOMPLETE
- Login page UI: COMPLETE
- Password Reset page UI: COMPLETE
- Password Reset Confirm page UI: COMPLETE
- API integration: MISSING (all TODO comments)
- Dashboard page: MISSING (referenced but not implemented)
- Admin page: MISSING (referenced but not implemented)
- Logout button/component: MISSING (API exists but no UI component)

## Acceptance Criteria Status

Due to the frontend-backend disconnect, **NONE** of the Acceptance Criteria can be properly tested. Below is the status based on code review:

### Login
- [x] Login-Formular mit E-Mail und Passwort-Feldern (UI exists)
- [x] "Angemeldet bleiben" Checkbox (UI exists)
- [ ] **BUG-1 CRITICAL:** "Login" Button führt NICHT zur Authentifizierung (API call fehlt)
- [x] "Passwort vergessen?" Link unterhalb des Login-Formulars
- [ ] **CANNOT TEST:** Bei erfolgreicher Authentifizierung: Weiterleitung (API nicht verbunden)
- [ ] **CANNOT TEST:** Bei falschen Credentials: Error Message (API nicht verbunden)
- [ ] **CANNOT TEST:** Session bleibt nach Browser-Reload erhalten (API nicht verbunden)
- [x] Passwort-Feld ist maskiert (type="password")
- [x] Passwort-Sichtbarkeit Toggle (Eye Icon funktioniert)

### "Angemeldet bleiben" Funktion
- [x] Checkbox "Angemeldet bleiben" im Login-Formular
- [ ] **CANNOT TEST:** Session-Token Gültigkeit (API nicht verbunden)
- [ ] **CANNOT TEST:** Token Storage (API nicht verbunden)
- [x] Hinweis-Text bei Checkbox: "Du bleibst 30 Tage angemeldet"

### Passwort-Reset
- [x] "Passwort vergessen?" Link auf Login-Seite
- [x] Klick öffnet "Passwort zurücksetzen" Formular
- [x] Formular-Feld: E-Mail (Pflichtfeld)
- [ ] **BUG-2 CRITICAL:** "Link senden" Button sendet KEINE E-Mail (API call fehlt)
- [x] Success Message wird angezeigt (aber fake, da kein API call)
- [ ] **CANNOT TEST:** Reset-E-Mail wird versendet (API nicht verbunden)
- [x] "Neues Passwort setzen" Seite existiert
- [x] Formular-Felder: Neues Passwort + Passwort wiederholen
- [x] Passwort-Stärke-Anzeige (schwach/mittel/stark) funktioniert
- [ ] **BUG-3 CRITICAL:** "Passwort ändern" Button setzt KEIN neues Passwort (API call fehlt)
- [x] Success Message wird angezeigt (aber fake)
- [x] Weiterleitung zur Login-Seite nach 3 Sekunden (funktioniert, aber sinnlos ohne API)

### Logout
- [ ] **BUG-4 CRITICAL:** "Logout" Button existiert NICHT (weder in Navigation noch sonst wo)
- [ ] **CANNOT TEST:** Logout beendet Session (kein Button vorhanden)
- [ ] **CANNOT TEST:** Weiterleitung nach Logout (kein Button vorhanden)

### Rollen-System
- [x] Backend: User hat Rolle (DB-Schema korrekt)
- [ ] **CANNOT TEST:** Weiterleitung nach Rolle (Frontend nicht verbunden)
- [x] Middleware: Admin-Routen nur für Admins (Code vorhanden)
- [ ] **BUG-5 HIGH:** Dashboard-Seite existiert NICHT (Login würde zu 404 führen)
- [ ] **BUG-6 HIGH:** Admin-Seite existiert NICHT (Login würde zu 404 führen)

### Security
- [x] Passwörter werden gehasht gespeichert (bcrypt implementiert)
- [x] Rate-Limiting implementiert (5 Versuche pro Minute)
- [x] Session-Tokens mit JWT (7 oder 30 Tage)
- [x] Backend: Reset-Tokens einmalig verwendbar
- [x] Backend: Reset-Tokens 1 Stunde gültig
- [x] E-Mail-Versand rate-limited (3 E-Mails pro 15 Minuten)
- [ ] **CANNOT TEST:** Funktionalität ohne API-Integration nicht testbar

### UX/UI
- [x] Mobile-optimiert (Responsive CSS vorhanden)
- [x] Loading-State während Login-Request (UI vorhanden, aber fake)
- [x] Moderne, übersichtliche UI mit Animationen
- [x] Error Messages sind klar und verständlich (Texte gut)

## Edge Cases Status

**CANNOT TEST ANY EDGE CASES** - Frontend-Backend-Verbindung fehlt komplett.

### Login-Fehler
- [ ] **CANNOT TEST:** 5 falsche Login-Versuche → Sperre (API nicht verbunden)

### Session-Handling
- [ ] **CANNOT TEST:** Abgelaufener Token → Auto-Logout (API nicht verbunden)

### Account-Status
- [ ] **CANNOT TEST:** Deaktivierter Account → Error Message (API nicht verbunden)

### Netzwerk-Fehler
- [ ] **CANNOT TEST:** Keine Internet-Verbindung (kein echter API-Call)

### Doppelter Login
- [ ] **CANNOT TEST:** Mehrere Geräte gleichzeitig (API nicht verbunden)

### Passwort-Reset Edge Cases
- [ ] **CANNOT TEST:** Rate Limiting nach 3 Versuchen (API nicht verbunden)
- [ ] **CANNOT TEST:** User existiert nicht → gleiche Message (API nicht verbunden)
- [ ] **CANNOT TEST:** Abgelaufener Reset-Token (API nicht verbunden)
- [ ] **CANNOT TEST:** Bereits verwendeter Token (API nicht verbunden)
- [ ] **CANNOT TEST:** Ungültiger Token (API nicht verbunden)

### "Angemeldet bleiben" Edge Cases
- [ ] **CANNOT TEST:** Logout mit aktiviertem "Angemeldet bleiben" (kein Logout-Button)

## Security Testing

### SQL Injection Tests
- **CANNOT TEST:** Frontend macht keine echten Requests
- **CODE REVIEW:** Backend verwendet Drizzle ORM mit Prepared Statements (SECURE)

### JWT Token Manipulation
- **CANNOT TEST:** Frontend setzt keine Cookies
- **CODE REVIEW:** Backend verwendet `jose` Library für JWT-Signing (SECURE)

### Rate Limiting Tests
- **CANNOT TEST:** Frontend macht keine echten Requests
- **CODE REVIEW:** Backend hat In-Memory-Rate-Limiter implementiert (FUNCTIONAL)

### Password Security
- **CODE REVIEW:** Backend verwendet bcryptjs mit ausreichend Rounds (SECURE)

### Cookie Security
- **CODE REVIEW:** Backend setzt HttpOnly, Secure, SameSite=Strict Cookies (SECURE)

## Bugs Found

### BUG-1: Login-API nicht verbunden
- **Severity:** CRITICAL (BLOCKER)
- **Component:** `src/app/login/page.tsx`
- **Line:** 28-44
- **Issue:** Login-Formular ruft Backend-API NICHT auf, nur Simulation
- **Steps to Reproduce:**
  1. Öffne http://localhost:3000/login
  2. Gib beliebige E-Mail und Passwort ein
  3. Klicke "Anmelden"
  4. ACTUAL: Nur Console-Log, kein echter API-Call
  5. EXPECTED: POST zu `/api/auth/login` mit echten Credentials
- **Impact:** Login ist komplett non-functional
- **Priority:** P0 - Muss sofort gefixt werden

**Evidence:**
```typescript
// TODO: Implement actual login logic with API call
// const response = await fetch('/api/auth/login', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({ email, password, rememberMe })
// })

// Placeholder for now
console.log('Login attempt:', { email, password, rememberMe })
```

### BUG-2: Password-Reset-API nicht verbunden
- **Severity:** CRITICAL (BLOCKER)
- **Component:** `src/app/reset-password/page.tsx`
- **Line:** 25-37
- **Issue:** Password-Reset-Formular ruft Backend-API NICHT auf
- **Steps to Reproduce:**
  1. Öffne http://localhost:3000/reset-password
  2. Gib beliebige E-Mail ein
  3. Klicke "Link senden"
  4. ACTUAL: Nur Console-Log, keine E-Mail wird versendet
  5. EXPECTED: POST zu `/api/auth/reset-password`
- **Impact:** Passwort-Reset ist komplett non-functional
- **Priority:** P0 - Muss sofort gefixt werden

### BUG-3: Password-Reset-Confirm-API nicht verbunden
- **Severity:** CRITICAL (BLOCKER)
- **Component:** `src/app/reset-password/confirm/page.tsx`
- **Line:** 81-96
- **Issue:** Neues-Passwort-Formular ruft Backend-API NICHT auf
- **Steps to Reproduce:**
  1. Öffne http://localhost:3000/reset-password/confirm?token=xxx
  2. Gib neues Passwort ein (2x)
  3. Klicke "Passwort ändern"
  4. ACTUAL: Nur Console-Log, Passwort wird nicht geändert
  5. EXPECTED: POST zu `/api/auth/reset-password/confirm`
- **Impact:** Passwort kann nicht zurückgesetzt werden
- **Priority:** P0 - Muss sofort gefixt werden

### BUG-4: Logout-Button fehlt komplett
- **Severity:** CRITICAL (BLOCKER)
- **Issue:** Keine UI-Komponente für Logout vorhanden
- **Steps to Reproduce:**
  1. Suche nach Logout-Button in der App
  2. ACTUAL: Kein Button, kein Link, nichts
  3. EXPECTED: Logout-Button in Navigation nach Login
- **Impact:** User kann sich nicht ausloggen (auch wenn Login funktionieren würde)
- **Priority:** P0 - Muss implementiert werden
- **Note:** Backend-API `/api/auth/logout` existiert bereits

### BUG-5: Dashboard-Seite fehlt
- **Severity:** HIGH
- **Issue:** `/dashboard` Route existiert nicht
- **Impact:** Nach erfolgreichem Login würde Mitarbeiter auf 404-Seite landen
- **Steps to Reproduce:**
  1. Versuche http://localhost:3000/dashboard zu öffnen
  2. ACTUAL: 404 Not Found
  3. EXPECTED: Dashboard für Mitarbeiter
- **Priority:** P0 - Muss implementiert werden (Login-Redirect würde sonst fehlschlagen)

### BUG-6: Admin-Seite fehlt
- **Severity:** HIGH
- **Issue:** `/admin` Route existiert nicht
- **Impact:** Nach erfolgreichem Login würde Admin auf 404-Seite landen
- **Steps to Reproduce:**
  1. Versuche http://localhost:3000/admin zu öffnen
  2. ACTUAL: 404 Not Found
  3. EXPECTED: Admin-Portal
- **Priority:** P0 - Muss implementiert werden (Login-Redirect würde sonst fehlschlagen)

## Additional Issues Found

### ISSUE-1: Database Setup unclear
- **Severity:** HIGH
- **Issue:** Unclear if PostgreSQL database is set up and seeded with test users
- **Impact:** Even if frontend is connected, testing requires test users in database
- **Recommendation:** Create seed script with test users (1 Mitarbeiter, 1 Admin)

### ISSUE-2: Email Service not configured
- **Severity:** MEDIUM
- **Issue:** No mention of Resend API key or SMTP configuration
- **Impact:** Password-Reset emails will fail even after frontend is connected
- **Recommendation:** Document email service setup or create mock for development

### ISSUE-3: Environment Variables missing
- **Severity:** MEDIUM
- **Issue:** `.env.local` might be missing required variables
- **Impact:** Backend might crash on startup if JWT_SECRET or DATABASE_URL missing
- **Recommendation:** Validate all required ENV vars are set

## Positive Findings

Despite the critical issues, the implementation shows good practices:

- Well-structured code organization
- Clean separation of concerns (Backend vs Frontend)
- Modern UI with shadcn/ui components
- Proper TypeScript usage
- Security-minded backend implementation (bcrypt, JWT, HttpOnly cookies)
- Rate limiting implemented
- Comprehensive database schema
- Middleware for route protection

## Summary

**Test Coverage:** 0% (Unable to test due to missing API integration)
**Passed Acceptance Criteria:** 0 / 35
**Failed Acceptance Criteria:** 6 Critical, 29 Cannot Test
**Bugs Found:** 6 CRITICAL (Blockers)
**Security Issues:** 0 (Backend code looks secure, but cannot be tested)

## Production-Ready Decision

**VERDICT: NOT PRODUCTION-READY**

**Blocking Issues:**
1. Frontend is completely disconnected from Backend (all 3 pages non-functional)
2. Dashboard and Admin pages don't exist (Login would redirect to 404)
3. No Logout functionality (users would be stuck after login)
4. Cannot test any functionality without API integration
5. Unknown database/user setup status
6. Unknown email service configuration status

**Must-Fix Before Testing:**
1. Connect Login page to `/api/auth/login` (BUG-1)
2. Connect Password-Reset page to `/api/auth/reset-password` (BUG-2)
3. Connect Password-Reset-Confirm page to `/api/auth/reset-password/confirm` (BUG-3)
4. Implement Logout button/component (BUG-4)
5. Create Dashboard page at `/dashboard` (BUG-5)
6. Create Admin page at `/admin` (BUG-6)
7. Set up database with test users
8. Configure email service (or mock for dev)

**Estimated Effort to Fix:** 4-8 hours for Frontend Developer

**Next Steps:**
1. Frontend Developer must complete API integration (remove all TODOs)
2. Create Dashboard and Admin pages (can be minimal for MVP)
3. Add Logout button to layout/navigation
4. Set up database with seed data
5. Configure email service
6. QA must re-test all Acceptance Criteria after fixes
7. Security Testing must be performed with real API calls

## Recommendation

**DO NOT DEPLOY TO PRODUCTION** until all 6 critical bugs are fixed and full regression testing is completed.

The backend implementation is solid and well-architected. The frontend UI is polished and user-friendly. However, the missing integration between frontend and backend makes the entire feature non-functional.

**Positive Note:** Once the API integration is completed (which should be straightforward), the feature has a high likelihood of working correctly given the solid backend foundation.

---

**QA Testing Status:** BLOCKED - Waiting for Frontend-Backend Integration

**Re-test Required After:** BUG-1, BUG-2, BUG-3, BUG-4, BUG-5, BUG-6 are fixed

---

## 🔧 Bug Fixes - Frontend Developer (2026-02-11)

**Status:** ✅ ALL CRITICAL BUGS FIXED

### Fixed Issues

#### ✅ BUG-1 FIXED: Login-API connected
- **File:** `src/app/login/page.tsx`
- **Changes:**
  - Removed TODO comments
  - Implemented real API call to `/api/auth/login`
  - Added proper error handling for network and authentication errors
  - Implemented role-based redirect (Admin → `/admin`, Mitarbeiter → `/dashboard`)
  - Using `window.location.href` for hard redirect (Auth Best Practice)

#### ✅ BUG-2 FIXED: Password-Reset-API connected
- **File:** `src/app/reset-password/page.tsx`
- **Changes:**
  - Removed TODO comments
  - Implemented real API call to `/api/auth/reset-password`
  - Added error handling for rate limiting and network errors
  - Security: Same success message regardless of user existence

#### ✅ BUG-3 FIXED: Password-Reset-Confirm-API connected
- **File:** `src/app/reset-password/confirm/page.tsx`
- **Changes:**
  - Removed TODO comments
  - Implemented real API call to `/api/auth/reset-password/confirm`
  - Added error handling for expired/invalid tokens
  - Proper loading state management

#### ✅ BUG-4 FIXED: Logout-Button created
- **New File:** `src/components/LogoutButton.tsx`
- **Implementation:**
  - Client component with loading state
  - Calls `/api/auth/logout` API endpoint
  - Hard redirect to `/login` after successful logout
  - Integrated into Dashboard and Admin page headers
  - Uses shadcn/ui Button component

#### ✅ BUG-5 FIXED: Dashboard page created
- **New File:** `src/app/dashboard/page.tsx`
- **Implementation:**
  - Mitarbeiter dashboard with auth check via `/api/auth/me`
  - Auto-redirect to `/login` if not authenticated
  - Displays user information (email, role)
  - Includes Logout button in header
  - Placeholder cards for future features (Zeiterfassung, etc.)
  - Responsive design with HofZeit branding

#### ✅ BUG-6 FIXED: Admin page created
- **New File:** `src/app/admin/page.tsx`
- **Implementation:**
  - Admin portal with role-based access check
  - Auto-redirect to `/dashboard` if user is not admin
  - Auto-redirect to `/login` if not authenticated
  - Admin badge in header
  - Placeholder cards for future admin features (User Management, Settings)
  - Responsive design with purple/indigo theme

### Implementation Summary

**Files Changed:**
- ✏️ Modified: `src/app/login/page.tsx` (Lines 27-52)
- ✏️ Modified: `src/app/reset-password/page.tsx` (Lines 24-46)
- ✏️ Modified: `src/app/reset-password/confirm/page.tsx` (Lines 80-104)
- ➕ Created: `src/components/LogoutButton.tsx`
- ➕ Created: `src/app/dashboard/page.tsx`
- ➕ Created: `src/app/admin/page.tsx`

**Technical Implementation:**
- All API calls use `fetch()` with proper error handling
- Hard redirects use `window.location.href` (Best Practice for Auth)
- Loading states prevent button spam
- Error messages are user-friendly and secure
- Auth checks on protected pages via `/api/auth/me`
- Role-based access control implemented

**Next Steps:**
1. ✅ All critical bugs fixed
2. ⏳ **READY FOR QA RE-TESTING**
3. ⏳ Database setup with test users required
4. ⏳ Email service configuration required (or mock for dev)

**QA Engineer:** Please re-test all Acceptance Criteria. The feature should now be fully functional.
