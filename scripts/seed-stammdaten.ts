// Load environment variables FIRST using require (synchronous)
const dotenv = require('dotenv')
const path = require('path')
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local')
  process.exit(1)
}

// Now dynamically import the database modules
import('../src/db').then(async ({ db }) => {
  const { activities, costCenters } = await import('../src/db/schema')
  const { eq } = await import('drizzle-orm')

  console.log('🌱 Seeding Stammdaten (Activities & Cost Centers)...')

  // Seed Activities
  const initialActivities = [
    { name: 'Büroarbeit', description: 'Administrative Tätigkeiten im Büro' },
    { name: 'Außendienst', description: 'Arbeiten vor Ort beim Kunden' },
    { name: 'Fahrtätigkeit', description: 'Fahrten zwischen verschiedenen Einsatzorten' },
  ]

  for (const activity of initialActivities) {
    // Check if exists
    const existing = await db
      .select()
      .from(activities)
      .where(eq(activities.name, activity.name))
      .limit(1)

    if (existing.length > 0) {
      console.log(`⏭️  Activity "${activity.name}" already exists, skipping...`)
      continue
    }

    await db.insert(activities).values(activity)
    console.log(`✅ Created activity: ${activity.name}`)
  }

  // Seed Cost Centers
  const initialCostCenters = [
    {
      name: 'Allgemein',
      number: 'KST-001',
      description: 'Allgemeine Kostenstelle für Standard-Tätigkeiten'
    },
  ]

  for (const costCenter of initialCostCenters) {
    // Check if exists
    const existing = await db
      .select()
      .from(costCenters)
      .where(eq(costCenters.name, costCenter.name))
      .limit(1)

    if (existing.length > 0) {
      console.log(`⏭️  Cost Center "${costCenter.name}" already exists, skipping...`)
      continue
    }

    await db.insert(costCenters).values(costCenter)
    console.log(`✅ Created cost center: ${costCenter.name} (${costCenter.number})`)
  }

  console.log('\n✨ Stammdaten seeding complete!')
  console.log('\n📋 Initial Stammdaten:')
  console.log('┌─────────────────────────────────────────────┐')
  console.log('│ Activities:                                 │')
  console.log('│   - Büroarbeit                              │')
  console.log('│   - Außendienst                             │')
  console.log('│   - Fahrtätigkeit                           │')
  console.log('├─────────────────────────────────────────────┤')
  console.log('│ Cost Centers:                               │')
  console.log('│   - Allgemein (KST-001)                     │')
  console.log('└─────────────────────────────────────────────┘')

  process.exit(0)
}).catch((error) => {
  console.error('❌ Seeding failed:', error)
  process.exit(1)
})
