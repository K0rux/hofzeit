/**
 * SMTP Connection Test
 *
 * Usage: npx tsx scripts/test-smtp.ts
 *
 * This script verifies that your SMTP configuration is correct
 * and can connect to the SMTP server.
 */

import * as dotenv from 'dotenv'
import { verifySmtpConnection, sendEmail } from '../src/lib/email'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testSmtp() {
  console.log('🔍 Testing SMTP Configuration...\n')

  // Show current config (without password)
  console.log('Current SMTP Configuration:')
  console.log('  Host:', process.env.SMTP_HOST || '❌ Not set')
  console.log('  Port:', process.env.SMTP_PORT || '❌ Not set')
  console.log('  Secure:', process.env.SMTP_SECURE || 'false')
  console.log('  User:', process.env.SMTP_USER || '❌ Not set')
  console.log('  From:', process.env.SMTP_FROM || '❌ Not set')
  console.log(
    '  Password:',
    process.env.SMTP_PASSWORD ? '***' + process.env.SMTP_PASSWORD.slice(-3) : '❌ Not set'
  )
  console.log('')

  // Check if required env vars are set
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.error('❌ Missing required SMTP environment variables!')
    console.error('Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in .env.local')
    process.exit(1)
  }

  // Test connection
  console.log('Testing SMTP connection...')
  const isConnected = await verifySmtpConnection()

  if (!isConnected) {
    console.error('\n❌ SMTP connection failed!')
    console.error('\nCommon issues:')
    console.error('- Wrong host or port')
    console.error('- Incorrect username or password')
    console.error('- SMTP_SECURE setting mismatch (try toggling true/false)')
    console.error('- Firewall blocking the connection')
    console.error('- Gmail: Need to use App Password (not regular password)')
    process.exit(1)
  }

  console.log('\n✅ SMTP connection successful!')

  // Ask if user wants to send a test email
  console.log('\n📧 Send a test email? (y/n)')
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  readline.question('> ', async (answer: string) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      readline.question('Enter recipient email: ', async (email: string) => {
        try {
          console.log('\nSending test email...')
          await sendEmail({
            to: email,
            subject: 'Test E-Mail - HofZeit Backend',
            html: `
              <h1>SMTP Test erfolgreich! ✅</h1>
              <p>Dein SMTP-Server ist korrekt konfiguriert und kann E-Mails versenden.</p>
              <p><strong>Server:</strong> ${process.env.SMTP_HOST}</p>
              <p><strong>Port:</strong> ${process.env.SMTP_PORT}</p>
              <p>Diese Test-E-Mail wurde von HofZeit Backend gesendet.</p>
            `,
          })
          console.log('✅ Test email sent successfully!')
        } catch (error) {
          console.error('❌ Failed to send test email:', error)
        } finally {
          readline.close()
          process.exit(0)
        }
      })
    } else {
      readline.close()
      console.log('\n✅ SMTP is ready to use!')
      process.exit(0)
    }
  })
}

testSmtp()
