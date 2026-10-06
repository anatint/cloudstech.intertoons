#!/usr/bin/env node
/**
 * Generates a PBKDF2 salt + hash for an admin password, for pasting into the
 * Wix `AdminUsers` collection. Run this yourself so your real password never
 * has to be typed anywhere else (chat, logs, etc).
 *
 * Usage: node scripts/hash-admin-password.mjs "your-password-here"
 */
import crypto from 'node:crypto'

const password = process.argv[2]
if (!password) {
  console.error('Usage: node scripts/hash-admin-password.mjs "your-password-here"')
  process.exit(1)
}

const ITERATIONS = 100_000
const salt = crypto.randomBytes(16)
const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, 32, 'sha256')

console.log('\nPaste these three values into the AdminUsers row in Wix:\n')
console.log('passwordSalt:', salt.toString('base64'))
console.log('passwordHash:', hash.toString('base64'))
console.log('iterations:  ', ITERATIONS)
console.log('\n(Your plaintext password was not sent or stored anywhere.)\n')
