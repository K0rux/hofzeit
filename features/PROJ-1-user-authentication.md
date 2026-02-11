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
