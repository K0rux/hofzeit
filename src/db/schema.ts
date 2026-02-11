import { pgTable, uuid, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// Enums
export const roleEnum = pgEnum('role', ['mitarbeiter', 'admin'])
export const statusEnum = pgEnum('status', ['aktiv', 'deaktiviert'])

// Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').notNull().default('mitarbeiter'),
  status: statusEnum('status').notNull().default('aktiv'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
  passwordChangedAt: timestamp('password_changed_at'),
})

// Password Reset Tokens Table
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').notNull().default(false),
})

// Login Attempts Table (for rate limiting)
export const loginAttempts = pgTable('login_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  ipAddress: text('ip_address').notNull(),
  email: text('email'),
  attemptedAt: timestamp('attempted_at').notNull().defaultNow(),
  successful: boolean('successful').notNull(),
})

// TypeScript Types (exported for use in API routes)
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert
export type LoginAttempt = typeof loginAttempts.$inferSelect
export type NewLoginAttempt = typeof loginAttempts.$inferInsert
