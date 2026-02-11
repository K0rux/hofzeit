import 'dotenv/config'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { db } from '../src/db'
import { users } from '../src/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

async function seedTestUsers() {
  console.log('🌱 Seeding test users...')

  const testUsers = [
    {
      email: 'mitarbeiter@hofzeit.app',
      password: 'test1234',
      role: 'mitarbeiter' as const,
      status: 'aktiv' as const,
    },
    {
      email: 'admin@hofzeit.app',
      password: 'admin1234',
      role: 'admin' as const,
      status: 'aktiv' as const,
    },
  ]

  for (const user of testUsers) {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email))
      .limit(1)

    if (existingUser.length > 0) {
      console.log(`⏭️  User ${user.email} already exists, skipping...`)
      continue
    }

    // Hash password
    const passwordHash = await bcrypt.hash(user.password, 10)

    // Insert user
    await db.insert(users).values({
      email: user.email,
      passwordHash,
      role: user.role,
      status: user.status,
    })

    console.log(`✅ Created user: ${user.email} (${user.role})`)
  }

  console.log('\n✨ Seeding complete!')
  console.log('\n📋 Test User Credentials:')
  console.log('┌─────────────────────────────────────────────┐')
  console.log('│ Mitarbeiter Account:                        │')
  console.log('│   Email:    mitarbeiter@hofzeit.app         │')
  console.log('│   Password: test1234                        │')
  console.log('│   Role:     mitarbeiter                     │')
  console.log('├─────────────────────────────────────────────┤')
  console.log('│ Admin Account:                              │')
  console.log('│   Email:    admin@hofzeit.app               │')
  console.log('│   Password: admin1234                       │')
  console.log('│   Role:     admin                           │')
  console.log('└─────────────────────────────────────────────┘')
  console.log('\n🚀 You can now test at http://localhost:3000/login')

  process.exit(0)
}

seedTestUsers().catch((error) => {
  console.error('❌ Seeding failed:', error)
  process.exit(1)
})
