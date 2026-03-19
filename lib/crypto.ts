import { createHmac, randomBytes, createCipheriv, createDecipheriv } from 'crypto'

const ENCRYPTION_KEY_HEX = process.env.ENCRYPTION_KEY ?? '0'.repeat(64)
const HMAC_SECRET = process.env.HMAC_SECRET ?? 'default-hmac-secret'

function getKeyBuffer(): Buffer {
  return Buffer.from(ENCRYPTION_KEY_HEX, 'hex')
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a base64-encoded string in the format: iv:authTag:ciphertext
 */
export function encrypt(plaintext: string): string {
  const key = getKeyBuffer()
  const iv = randomBytes(12) // 96-bit IV for GCM
  const cipher = createCipheriv('aes-256-gcm', key, iv)

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  return [
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':')
}

/**
 * Decrypt an AES-256-GCM encrypted string.
 */
export function decrypt(encryptedData: string): string {
  const [ivB64, authTagB64, ciphertextB64] = encryptedData.split(':')
  if (!ivB64 || !authTagB64 || !ciphertextB64) {
    throw new Error('Invalid encrypted data format')
  }

  const key = getKeyBuffer()
  const iv = Buffer.from(ivB64, 'base64')
  const authTag = Buffer.from(authTagB64, 'base64')
  const ciphertext = Buffer.from(ciphertextB64, 'base64')

  const decipher = createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ])
  return decrypted.toString('utf8')
}

/**
 * Create a deterministic HMAC-SHA256 hash for indexed PII lookups.
 */
export function hmacHash(value: string): string {
  return createHmac('sha256', HMAC_SECRET).update(value.toLowerCase()).digest('hex')
}

/**
 * Mask a phone number, showing only the last 4 digits.
 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length <= 4) return '****'
  return '*'.repeat(digits.length - 4) + digits.slice(-4)
}

/**
 * Generate a cryptographically secure random token.
 */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex')
}

/**
 * Generate a numeric OTP.
 */
export function generateOTP(digits = 6): string {
  const max = Math.pow(10, digits)
  const otp = Math.floor(Math.random() * max)
  return otp.toString().padStart(digits, '0')
}

/**
 * Timing-safe comparison for TOTP / tokens.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  const { timingSafeEqual: cryptoTimingSafeEqual } = require('crypto')
  if (a.length !== b.length) return false
  return cryptoTimingSafeEqual(Buffer.from(a), Buffer.from(b))
}
