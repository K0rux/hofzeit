# Backend Setup Guide - PROJ-1 User Authentication

Das Backend für die User Authentication ist implementiert! 🎉

Hier sind die Schritte, um das Backend zum Laufen zu bringen:

---

## 1. PostgreSQL Datenbank einrichten

Du hast zwei Optionen:

### Option A: Lokale PostgreSQL Installation

```bash
# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Windows (via Installer)
# Download von: https://www.postgresql.org/download/windows/

# Linux (Ubuntu/Debian)
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

Dann erstelle eine Datenbank:

```bash
# Als postgres User einloggen
psql postgres

# Datenbank erstellen
CREATE DATABASE hofzeit;

# User erstellen (optional)
CREATE USER hofzeit_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE hofzeit TO hofzeit_user;
```

Deine `DATABASE_URL` wäre dann:
```
postgresql://hofzeit_user:your_password@localhost:5432/hofzeit
```

### Option B: Cloud PostgreSQL (Empfohlen für Produktion)

- **Supabase** (kostenloser Tier): https://supabase.com (nutze nur die Datenbank, nicht Auth!)
- **Neon** (kostenloser Tier): https://neon.tech
- **Railway** (kostenloser Tier): https://railway.app

Nach der Erstellung bekommst du eine `DATABASE_URL` im Format:
```
postgresql://username:password@host:port/database
```

---

## 2. SMTP Server konfigurieren (für E-Mails)

Du kannst jeden beliebigen SMTP-Server verwenden:

### Option A: Eigener SMTP-Server
Wenn du bereits einen eigenen Mail-Server hast, nutze dessen SMTP-Credentials.

### Option B: Gmail (für Development)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=deine-email@gmail.com
SMTP_PASSWORD=app-spezifisches-passwort
```
**Wichtig:** Erstelle ein App-Passwort (nicht dein Gmail-Passwort):
https://myaccount.google.com/apppasswords

### Option C: Cloud-SMTP-Provider
- **SendGrid** (kostenlos: 100 E-Mails/Tag): https://sendgrid.com
- **Mailgun** (kostenlos: 5.000 E-Mails/Monat): https://mailgun.com
- **AWS SES** (günstig, aber komplex): https://aws.amazon.com/ses
- **SMTP2GO** (kostenlos: 1.000 E-Mails/Monat): https://smtp2go.com

Jeder Anbieter gibt dir SMTP-Credentials (Host, Port, User, Password).

---

## 3. Environment Variables konfigurieren

Erstelle eine `.env.local` Datei im Root-Verzeichnis:

```bash
cp .env.local.example .env.local
```

Dann fülle die Werte aus:

```env
# PostgreSQL Verbindung (von Schritt 1)
DATABASE_URL=postgresql://user:password@host:5432/hofzeit

# JWT Secret (generiere mit: openssl rand -base64 32)
JWT_SECRET=dein-super-geheimer-random-string-min-32-zeichen

# SMTP Configuration (von Schritt 2)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=noreply@hofzeit.app

# App URL (für E-Mail-Links)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Upstash Redis (für Production Rate-Limiting)
# Lokal wird In-Memory Rate-Limiting verwendet
# UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
# UPSTASH_REDIS_REST_TOKEN=xxxxxxxxxxxxx
```

**SMTP Port Erklärung:**
- `587` - STARTTLS (empfohlen, SMTP_SECURE=false)
- `465` - SSL/TLS (SMTP_SECURE=true)
- `25` - Unverschlüsselt (nicht empfohlen)

**JWT_SECRET generieren:**
```bash
# macOS/Linux
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

---

## 4. Database Migrations ausführen

Jetzt können wir die Datenbank-Tabellen erstellen:

```bash
# Migrations generieren
npm run db:generate

# Migrations auf Datenbank anwenden
npm run db:push
```

Das erstellt folgende Tabellen:
- `users` - User-Accounts (E-Mail, Passwort-Hash, Rolle, Status)
- `password_reset_tokens` - Passwort-Reset-Tokens
- `login_attempts` - Login-Versuche (für Rate-Limiting)

**Verifizierung:**
```bash
# Drizzle Studio starten (Datenbank-GUI)
npm run db:studio
```

Das öffnet https://local.drizzle.studio - hier kannst du die Tables sehen.

---

## 5. Test-User erstellen

Da User-Verwaltung noch nicht implementiert ist, erstelle einen Test-User manuell:

### Via Drizzle Studio (GUI):
1. `npm run db:studio`
2. Gehe zu "users" Table
3. Klicke "Add Row"
4. Füge ein:
   - `email`: `admin@hofzeit.app`
   - `password_hash`: **(siehe unten)**
   - `role`: `admin`
   - `status`: `aktiv`

### Passwort-Hash generieren:

Erstelle eine temporäre Datei `scripts/hash-password.ts`:

```typescript
import bcrypt from 'bcryptjs'

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(12)
  const hash = await bcrypt.hash(password, salt)
  console.log('Password hash:', hash)
}

hashPassword('admin123') // Ändere Passwort hier
```

Dann ausführen:
```bash
npx tsx scripts/hash-password.ts
```

Kopiere den Hash und füge ihn als `password_hash` ein.

**Alternative (schneller):** Via psql:

```sql
-- Füge User direkt ein (Passwort: admin123)
INSERT INTO users (email, password_hash, role, status)
VALUES (
  'admin@hofzeit.app',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewvi6IFAz4lS/h3i', -- admin123
  'admin',
  'aktiv'
);
```

---

## 6. Backend testen

Starte den Dev-Server:

```bash
npm run dev
```

### Teste die APIs mit curl/Thunder Client:

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hofzeit.app",
    "password": "admin123",
    "rememberMe": false
  }'
```

Erwartete Response:
```json
{
  "user": {
    "id": "...",
    "email": "admin@hofzeit.app",
    "role": "admin"
  },
  "redirectTo": "/admin"
}
```

**Get Current User:**
```bash
curl http://localhost:3000/api/auth/me \
  --cookie "session=<token-from-login>"
```

**Logout:**
```bash
curl -X POST http://localhost:3000/api/auth/logout
```

**Passwort-Reset anfordern:**
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@hofzeit.app"}'
```

---

## 8. Nächste Schritte

Backend ist fertig! ✅

**Was jetzt noch fehlt:**
1. **Frontend-Integration** - Login/Logout/Reset-Password Pages (Frontend Developer)
2. **User-Management** - Admin-Panel zum Erstellen von Users (PROJ-2)
3. **Testing** - QA Engineer testet alle Acceptance Criteria

---

## Troubleshooting

### "DATABASE_URL is not set"
- Prüfe, ob `.env.local` existiert und `DATABASE_URL` gesetzt ist
- Restart Dev-Server nach Änderungen in `.env.local`

### SMTP Connection Failed
- **Teste SMTP-Verbindung:**
  ```bash
  # Erstelle test-smtp.ts
  npx tsx -e "import { verifySmtpConnection } from './src/lib/email'; verifySmtpConnection()"
  ```
- **Häufige Fehler:**
  - `ECONNREFUSED`: Falscher Host/Port oder Firewall blockiert
  - `Invalid login`: Falsche SMTP_USER oder SMTP_PASSWORD
  - `Self-signed certificate`: SMTP_SECURE auf `false` setzen (bei Port 587)
  - `530 Authentication required`: SMTP-Auth aktivieren

### E-Mail wird nicht gesendet
- **Logs checken:** Terminal/Console zeigt SMTP-Fehler
- **Gmail:** App-Passwort verwenden (nicht normales Passwort)
  - https://myaccount.google.com/apppasswords
- **Port-Probleme:**
  - Port 587 (STARTTLS): `SMTP_SECURE=false`
  - Port 465 (SSL/TLS): `SMTP_SECURE=true`
- **Firewall:** Port 587/465 muss offen sein

### Rate-Limiting funktioniert nicht
- Lokal wird In-Memory Cache verwendet (funktioniert nur im selben Prozess)
- Für Production: Upstash Redis konfigurieren

### JWT-Fehler "invalid signature"
- `JWT_SECRET` hat sich geändert → Alte Tokens sind ungültig
- User müssen sich neu einloggen
- Lösung: Cookie "session" manuell löschen

---

## Code-Struktur

```
src/
├── db/
│   ├── schema.ts          # Drizzle Schema (Tables)
│   └── index.ts           # Database Connection
├── lib/
│   ├── auth.ts            # JWT + Passwort-Hashing
│   ├── rate-limit.ts      # Rate-Limiting
│   └── email.ts           # SMTP E-Mail-Versand
├── emails/
│   └── password-reset.tsx # E-Mail-Template
├── app/
│   └── api/
│       └── auth/
│           ├── login/route.ts              # POST /api/auth/login
│           ├── logout/route.ts             # POST /api/auth/logout
│           ├── me/route.ts                 # GET /api/auth/me
│           └── reset-password/
│               ├── route.ts                # POST /api/auth/reset-password
│               └── confirm/route.ts        # POST /api/auth/reset-password/confirm
└── middleware.ts          # Route-Protection

drizzle.config.ts          # Drizzle Config
.env.local.example         # Environment Variables Template
```

---

**Bei Fragen:** Frag den Backend Developer Agent! 🤖
