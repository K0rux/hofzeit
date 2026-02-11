/**
 * Password Hashing Utility
 *
 * Usage: npx tsx scripts/hash-password.ts <password>
 * Example: npx tsx scripts/hash-password.ts admin123
 */

import bcrypt from 'bcryptjs'

async function hashPassword(password: string) {
  if (!password) {
    console.error('❌ Error: Password argument is required')
    console.log('Usage: npx tsx scripts/hash-password.ts <password>')
    console.log('Example: npx tsx scripts/hash-password.ts admin123')
    process.exit(1)
  }

  try {
    const salt = await bcrypt.genSalt(12)
    const hash = await bcrypt.hash(password, salt)

    console.log('✅ Password hashed successfully!\n')
    console.log('Password:', password)
    console.log('Hash:', hash)
    console.log('\nYou can use this hash in the database:')
    console.log(`\nINSERT INTO users (email, password_hash, role, status)`)
    console.log(`VALUES ('user@example.com', '${hash}', 'mitarbeiter', 'aktiv');`)
  } catch (error) {
    console.error('❌ Error hashing password:', error)
    process.exit(1)
  }
}

const password = process.argv[2]
hashPassword(password)
