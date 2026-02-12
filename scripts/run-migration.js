// Script to run database migrations
// Usage: node scripts/run-migration.js <migration-file>

const postgres = require('postgres')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local')
  process.exit(1)
}

const migrationFile = process.argv[2]
if (!migrationFile) {
  console.error('❌ Usage: node scripts/run-migration.js <migration-file>')
  process.exit(1)
}

const migrationPath = path.join(process.cwd(), migrationFile)
if (!fs.existsSync(migrationPath)) {
  console.error(`❌ Migration file not found: ${migrationPath}`)
  process.exit(1)
}

async function runMigration() {
  const sql = postgres(process.env.DATABASE_URL)

  try {
    console.log(`🔄 Running migration: ${migrationFile}`)

    // Read migration SQL
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    // Execute migration
    await sql.unsafe(migrationSQL)

    console.log('✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

runMigration()
