/**
 * Admin session + password verification, built on the Web Crypto API so it
 * runs identically in the Cloudflare Workers runtime and in local `next dev`.
 * Passwords are never stored in plaintext — see `scripts/hash-admin-password.mjs`.
 */

const encoder = new TextEncoder()
const decoder = new TextDecoder()

export const ADMIN_SESSION_COOKIE = 'admin_session'

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}
function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}
function toBase64Url(b64: string): string {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function fromBase64Url(b64url: string): string {
  const pad = b64url.length % 4 === 0 ? '' : '='.repeat(4 - (b64url.length % 4))
  return b64url.replace(/-/g, '+').replace(/_/g, '/') + pad
}

/** Constant-time string compare — avoids leaking match length via timing. */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function pbkdf2Hash(password: string, saltB64: string, iterations: number): Promise<string> {
  const salt = base64ToBytes(saltB64)
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: 'SHA-256' }, keyMaterial, 256)
  return bytesToBase64(new Uint8Array(bits))
}

export async function verifyPassword(password: string, saltB64: string, expectedHashB64: string, iterations: number): Promise<boolean> {
  const computed = await pbkdf2Hash(password, saltB64, iterations)
  return constantTimeEqual(computed, expectedHashB64)
}

async function hmacSign(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  return toBase64Url(bytesToBase64(new Uint8Array(sig)))
}

export interface AdminSessionPayload {
  email: string
  exp: number // unix seconds
}

/** Sign a stateless session token: `base64url(payload).base64url(hmac)`. No server-side session store needed. */
export async function signSession(payload: AdminSessionPayload, secret: string): Promise<string> {
  const payloadB64 = toBase64Url(bytesToBase64(encoder.encode(JSON.stringify(payload))))
  const sig = await hmacSign(secret, payloadB64)
  return `${payloadB64}.${sig}`
}

/** Verify signature + expiry. Returns the payload if valid, else null. */
export async function verifySession(token: string | undefined | null, secret: string): Promise<AdminSessionPayload | null> {
  if (!token) return null
  const [payloadB64, sig] = token.split('.')
  if (!payloadB64 || !sig) return null
  const expectedSig = await hmacSign(secret, payloadB64)
  if (!constantTimeEqual(sig, expectedSig)) return null
  try {
    const payload = JSON.parse(decoder.decode(base64ToBytes(fromBase64Url(payloadB64)))) as AdminSessionPayload
    if (typeof payload.email !== 'string' || typeof payload.exp !== 'number') return null
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}
