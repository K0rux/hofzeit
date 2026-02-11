# API Documentation - HofZeit Backend

## Authentication Endpoints

Alle Authentication-Endpoints befinden sich unter `/api/auth/*`.

---

## POST /api/auth/login

Authentifiziert einen User mit E-Mail und Passwort.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": false  // Optional, default: false
}
```

**Success Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "mitarbeiter" | "admin"
  },
  "redirectTo": "/dashboard" | "/admin"
}
```

**Session Cookie wird gesetzt:**
- Name: `session`
- HttpOnly: `true`
- Secure: `true` (in Production)
- SameSite: `strict`
- MaxAge:
  - 7 Tage (Standard)
  - 30 Tage (mit `rememberMe: true`)

**Error Responses:**

**401 Unauthorized** - Falsche Credentials:
```json
{
  "error": "E-Mail oder Passwort falsch"
}
```

**403 Forbidden** - Account deaktiviert:
```json
{
  "error": "Dein Account wurde deaktiviert. Bitte kontaktiere den Administrator."
}
```

**429 Too Many Requests** - Rate Limit überschritten:
```json
{
  "error": "Zu viele fehlgeschlagene Versuche. Bitte versuche es in 5 Minuten erneut."
}
```

**Rate Limiting:**
- 5 Login-Versuche pro Minute pro IP-Adresse
- Nach 5 Fehlversuchen: 5 Minuten Sperre

---

## POST /api/auth/logout

Beendet die aktuelle Session.

**Request Body:** Keine

**Success Response (200):**
```json
{
  "success": true
}
```

**Session Cookie wird gelöscht.**

---

## GET /api/auth/me

Gibt den aktuell eingeloggten User zurück.

**Request:** Keine Body, Session-Cookie wird automatisch gesendet

**Success Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "mitarbeiter" | "admin",
    "status": "aktiv" | "deaktiviert"
  }
}
```

**Error Responses:**

**401 Unauthorized** - Nicht authentifiziert:
```json
{
  "error": "Nicht authentifiziert"
}
```

**403 Forbidden** - Account deaktiviert:
```json
{
  "error": "Account wurde deaktiviert"
}
```

**404 Not Found** - User nicht gefunden:
```json
{
  "error": "User nicht gefunden"
}
```

---

## POST /api/auth/reset-password

Sendet eine Passwort-Reset-E-Mail.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "Falls ein Account mit dieser E-Mail existiert, haben wir dir einen Link zum Zurücksetzen geschickt."
}
```

**Hinweis:** Aus Sicherheitsgründen wird immer die gleiche Success-Message zurückgegeben, unabhängig davon, ob der User existiert oder nicht (verhindert User-Enumeration).

**Error Responses:**

**400 Bad Request** - Ungültige E-Mail:
```json
{
  "error": "Ungültige E-Mail-Adresse"
}
```

**429 Too Many Requests** - Rate Limit überschritten:
```json
{
  "error": "Zu viele Anfragen. Bitte warte 15 Minuten."
}
```

**Rate Limiting:**
- 3 Reset-Anfragen pro 15 Minuten pro E-Mail-Adresse

**Reset-E-Mail enthält:**
- Link mit Token: `{APP_URL}/reset-password/confirm?token={token}`
- Token-Gültigkeit: 1 Stunde
- Token kann nur 1x verwendet werden

---

## POST /api/auth/reset-password/confirm

Setzt ein neues Passwort mit einem Reset-Token.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "newPassword123",
  "passwordConfirm": "newPassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Passwort wurde erfolgreich geändert. Du kannst dich jetzt einloggen."
}
```

**Error Responses:**

**400 Bad Request** - Validation-Fehler:

*Passwort zu kurz:*
```json
{
  "error": "Passwort muss mindestens 8 Zeichen lang sein"
}
```

*Passwörter stimmen nicht überein:*
```json
{
  "error": "Passwörter stimmen nicht überein"
}
```

*Ungültiger Token:*
```json
{
  "error": "Ungültiger Link. Bitte fordere einen neuen Link an."
}
```

*Token bereits verwendet:*
```json
{
  "error": "Dieser Link wurde bereits verwendet. Bitte fordere einen neuen Link an."
}
```

*Token abgelaufen (> 1 Stunde):*
```json
{
  "error": "Dieser Link ist abgelaufen. Bitte fordere einen neuen Link an."
}
```

---

## GET /api/auth/reset-password/confirm?token={token}

Prüft die Gültigkeit eines Reset-Tokens (optional, für UX).

**Query Parameters:**
- `token` - Der Reset-Token aus der E-Mail

**Success Response (200):**
```json
{
  "valid": true
}
```

**Invalid Token Response (200):**
```json
{
  "valid": false,
  "error": "invalid" | "used" | "expired"
}
```

---

## Middleware (Route Protection)

Die Middleware prüft automatisch bei jedem Request:

**Geschützte Routen:**
- `/dashboard/*` - Für alle eingeloggten User
- `/admin/*` - Nur für Admins

**Verhalten:**
- Wenn nicht authentifiziert → Redirect zu `/login?redirect={originalPath}`
- Wenn Session abgelaufen → Redirect zu `/login?message=Session%20abgelaufen`
- Wenn Non-Admin versucht `/admin` zu öffnen → Redirect zu `/dashboard`

**Public Routen (kein Auth erforderlich):**
- `/login`
- `/reset-password`
- `/`
- `/api/auth/*`

---

## Security Features

### JWT-Tokens
- **Algorithmus:** HS256
- **Gültigkeit:**
  - 7 Tage (Standard)
  - 30 Tage (mit "Angemeldet bleiben")
- **Payload:**
  ```json
  {
    "userId": "uuid",
    "email": "user@example.com",
    "role": "mitarbeiter" | "admin",
    "iat": 1234567890,
    "exp": 1234567890
  }
  ```

### Passwort-Hashing
- **Algorithmus:** bcrypt
- **Cost Factor:** 12
- **Salting:** Automatisch pro Passwort

### Rate Limiting
- **Login:** 5 Versuche/Minute pro IP
- **Reset-E-Mail:** 3 Anfragen/15min pro E-Mail
- **Storage:** In-Memory (Dev) oder Upstash Redis (Production)

### CSRF Protection
- **SameSite:** `strict` auf Session-Cookie
- **HttpOnly:** `true` (JavaScript kann nicht zugreifen)
- **Secure:** `true` in Production (nur HTTPS)

---

## Error Handling

Alle Endpoints folgen dem gleichen Error-Format:

```json
{
  "error": "Fehlermeldung in Deutsch"
}
```

**Standard HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (Validation-Fehler)
- `401` - Unauthorized (Nicht authentifiziert)
- `403` - Forbidden (Nicht autorisiert, z.B. deaktivierter Account)
- `404` - Not Found
- `429` - Too Many Requests (Rate Limit)
- `500` - Internal Server Error

---

## Frontend Integration

### Login-Flow

```typescript
// 1. User gibt E-Mail + Passwort ein
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    rememberMe: false,
  }),
})

const data = await response.json()

if (response.ok) {
  // 2. Session-Cookie wurde automatisch gesetzt
  // 3. Redirect basierend auf Rolle
  window.location.href = data.redirectTo // "/dashboard" oder "/admin"
} else {
  // Error anzeigen
  console.error(data.error)
}
```

### Session-Check (Protected Pages)

```typescript
// Beim Laden einer geschützten Seite
const response = await fetch('/api/auth/me')

if (response.ok) {
  const { user } = await response.json()
  // User ist eingeloggt
} else {
  // Middleware hat bereits zu /login redirected
}
```

### Logout

```typescript
const response = await fetch('/api/auth/logout', { method: 'POST' })

if (response.ok) {
  window.location.href = '/login'
}
```

### Passwort-Reset Flow

```typescript
// 1. Reset anfordern
const response = await fetch('/api/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' }),
})

// 2. User klickt auf Link in E-Mail (/reset-password/confirm?token=xxx)

// 3. Neues Passwort setzen
const resetResponse = await fetch('/api/auth/reset-password/confirm', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: searchParams.get('token'),
    password: 'newPassword123',
    passwordConfirm: 'newPassword123',
  }),
})

if (resetResponse.ok) {
  // Redirect zu Login nach 3 Sekunden
  setTimeout(() => window.location.href = '/login', 3000)
}
```

---

## Database Schema

### users Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key (auto-generated) |
| email | TEXT | Unique, not null |
| password_hash | TEXT | bcrypt hash, not null |
| role | ENUM | 'mitarbeiter' \| 'admin', default: 'mitarbeiter' |
| status | ENUM | 'aktiv' \| 'deaktiviert', default: 'aktiv' |
| created_at | TIMESTAMP | Auto-generated |
| last_login_at | TIMESTAMP | Nullable, updated on login |
| password_changed_at | TIMESTAMP | Nullable, updated on password change |

### password_reset_tokens Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key (auto-generated) |
| user_id | UUID | Foreign Key → users.id (ON DELETE CASCADE) |
| token | TEXT | Unique, kryptographisch sicher |
| created_at | TIMESTAMP | Auto-generated |
| expires_at | TIMESTAMP | 1 Stunde nach created_at |
| used | BOOLEAN | Default: false, wird auf true gesetzt nach Nutzung |

### login_attempts Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key (auto-generated) |
| ip_address | TEXT | Not null |
| email | TEXT | Nullable |
| attempted_at | TIMESTAMP | Auto-generated |
| successful | BOOLEAN | Not null |

---

## Environment Variables

Siehe [.env.local.example](.env.local.example) für alle benötigten Variablen:

- `DATABASE_URL` - PostgreSQL Connection String
- `JWT_SECRET` - Min. 32 Zeichen (openssl rand -base64 32)
- `SMTP_*` - SMTP Server Konfiguration
- `NEXT_PUBLIC_APP_URL` - App-URL für E-Mail-Links
- `UPSTASH_REDIS_*` - Optional, für Production Rate-Limiting

---

## Testing

Siehe [BACKEND_SETUP.md](../BACKEND_SETUP.md) für:
- Test-User erstellen
- API-Testing mit curl/Thunder Client
- SMTP-Verbindung testen

---

**Version:** 1.0.0
**Letzte Aktualisierung:** 2026-02-11
