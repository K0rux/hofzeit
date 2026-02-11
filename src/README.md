# Source Code Structure

## Overview

```
src/
├── app/                    # Next.js App Router
│   ├── login/             # Login Page (Frontend)
│   ├── reset-password/    # Password Reset Pages (Frontend)
│   ├── dashboard/         # User Dashboard (Protected)
│   ├── admin/             # Admin Panel (Protected, Admin-Only)
│   ├── api/               # API Routes (Backend)
│   │   └── auth/          # Authentication Endpoints
│   │       ├── login/route.ts
│   │       ├── logout/route.ts
│   │       ├── me/route.ts
│   │       └── reset-password/
│   │           ├── route.ts
│   │           └── confirm/route.ts
│   ├── layout.tsx         # Root Layout
│   ├── page.tsx           # Home Page
│   └── globals.css        # Global Styles
├── components/            # React Components
│   └── ui/                # shadcn/ui Components
├── db/                    # Database
│   ├── schema.ts          # Drizzle Schema (Tables)
│   └── index.ts           # Database Connection
├── lib/                   # Utilities
│   ├── auth.ts            # JWT + Password Hashing
│   ├── email.ts           # SMTP Email Sending
│   ├── rate-limit.ts      # Rate Limiting
│   └── utils.ts           # General Utilities
├── emails/                # Email Templates
│   └── password-reset.tsx # Password Reset Email (React)
├── hooks/                 # React Hooks
└── middleware.ts          # Route Protection Middleware
```

---

## API Routes

All API routes are in `src/app/api/auth/`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Authenticate user |
| `/api/auth/logout` | POST | End session |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/reset-password` | POST | Request password reset |
| `/api/auth/reset-password/confirm` | POST | Set new password |
| `/api/auth/reset-password/confirm?token=xxx` | GET | Verify reset token |

**Full API Documentation:** [docs/API_DOCUMENTATION.md](../docs/API_DOCUMENTATION.md)

---

## Database Schema

Drizzle ORM schema defined in `src/db/schema.ts`:

**Tables:**
- `users` - User accounts (email, password_hash, role, status)
- `password_reset_tokens` - Reset tokens (1-hour expiry)
- `login_attempts` - Failed login tracking (rate limiting)

**Types exported:**
```typescript
import { User, NewUser } from '@/db/schema'
```

---

## Authentication Flow

### Login
1. User submits email + password via Frontend
2. `POST /api/auth/login` verifies credentials
3. JWT token created with 7-day or 30-day expiry
4. Token stored in HttpOnly cookie
5. User redirected to `/dashboard` or `/admin`

### Session Check
1. Middleware reads cookie on every request
2. JWT verified and decoded
3. If invalid/expired → Redirect to `/login`
4. If admin-route + non-admin → Redirect to `/dashboard`

### Logout
1. `POST /api/auth/logout` deletes cookie
2. User redirected to `/login`

### Password Reset
1. User requests reset via `POST /api/auth/reset-password`
2. Reset token generated (64-char hex)
3. Email sent with link: `/reset-password/confirm?token=xxx`
4. User clicks link, submits new password
5. `POST /api/auth/reset-password/confirm` validates token
6. Password updated, token marked as used

---

## Security Features

### JWT Tokens
- **Algorithm:** HS256
- **Secret:** `process.env.JWT_SECRET` (min. 32 chars)
- **Payload:** userId, email, role, iat, exp
- **Storage:** HttpOnly cookie (SameSite=strict, Secure in prod)

### Password Hashing
- **Algorithm:** bcrypt
- **Cost Factor:** 12
- **Salting:** Automatic per password

### Rate Limiting
- **Login:** 5 attempts/minute per IP
- **Reset:** 3 requests/15min per email
- **Storage:** In-Memory (dev) or Upstash Redis (prod)

### CSRF Protection
- **SameSite:** `strict` on all cookies
- **HttpOnly:** `true` (JavaScript can't access)
- **Secure:** `true` in production (HTTPS only)

---

## Libraries Used

### Backend
- `drizzle-orm` - Type-safe SQL queries
- `postgres` - PostgreSQL client
- `bcryptjs` - Password hashing
- `jose` - JWT signing/verification (Edge-compatible)
- `nodemailer` - SMTP email sending
- `@upstash/ratelimit` - Rate limiting

### Frontend
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `@radix-ui/*` - Headless UI primitives (via shadcn/ui)
- `lucide-react` - Icons

### Email
- `react-email` - React-based email templates
- `@react-email/components` - Email components (Button, Text, etc.)

---

## Environment Variables

Required in `.env.local`:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/hofzeit

# Auth
JWT_SECRET=random-32-char-string

# SMTP (Email)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=username
SMTP_PASSWORD=password
SMTP_FROM=noreply@hofzeit.app

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Rate Limiting (Production)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

See [.env.local.example](../.env.local.example) for template.

---

## Adding New Features

### Backend (API Route)

1. Create new route in `src/app/api/your-feature/route.ts`
2. Import utilities:
   ```typescript
   import { db } from '@/db'
   import { getSession } from '@/lib/auth'
   ```
3. Validate input with Zod:
   ```typescript
   const schema = z.object({ ... })
   const result = schema.safeParse(body)
   ```
4. Return JSON:
   ```typescript
   return NextResponse.json({ data })
   ```

### Database (New Table)

1. Add table to `src/db/schema.ts`:
   ```typescript
   export const myTable = pgTable('my_table', {
     id: uuid('id').primaryKey().defaultRandom(),
     // ... columns
   })
   ```
2. Generate migration:
   ```bash
   npm run db:generate
   ```
3. Apply to database:
   ```bash
   npm run db:push
   ```

### Frontend (Protected Page)

1. Create page in `src/app/your-page/page.tsx`
2. Middleware automatically protects it if in `/dashboard/*` or `/admin/*`
3. Use `fetch('/api/auth/me')` to get current user

---

## Troubleshooting

**"Module not found" errors:**
- Restart dev server after installing dependencies
- Check `tsconfig.json` paths are correct

**Database connection errors:**
- Verify `DATABASE_URL` in `.env.local`
- Check PostgreSQL is running
- Test connection with `npm run db:studio`

**JWT errors:**
- Ensure `JWT_SECRET` is set and > 32 chars
- Check cookies are enabled in browser
- Verify HTTPS in production (JWT requires Secure=true)

**SMTP errors:**
- Test connection: `npm run test:smtp`
- Check firewall allows port 587/465
- For Gmail: Use App Password (not regular password)

---

**For full setup guide:** See [BACKEND_SETUP.md](../BACKEND_SETUP.md)
