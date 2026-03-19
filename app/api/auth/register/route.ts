import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { encrypt, hmacHash } from '@/lib/crypto'
import { registerSchema } from '@/lib/validations/auth'
import { auditLog } from '@/lib/audit'
import { checkRateLimit } from '@/lib/rate-limit'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  // Rate limiting: 5 registrations per 15 minutes per IP
  const rateLimitResponse = checkRateLimit(req, { limit: 5, windowMs: 15 * 60 * 1000 })
  if (rateLimitResponse) return rateLimitResponse

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 }
    )
  }

  const { name, email, password } = parsed.data
  const emailLower = email.toLowerCase()
  const emailHash = hmacHash(emailLower)

  // Check if email already exists
  const existing = await db.user.findFirst({
    where: { OR: [{ email: emailLower }, { emailHash }] },
    select: { id: true },
  })

  if (existing) {
    return NextResponse.json(
      { error: 'An account with this email already exists.' },
      { status: 409 }
    )
  }

  // Hash password with bcrypt cost 12
  const passwordHash = await bcrypt.hash(password, 12)

  // Encrypt PII
  const nameEncrypted = encrypt(name)

  const user = await db.user.create({
    data: {
      email: emailLower,
      emailHash,
      passwordHash,
      nameEncrypted,
      role: 'GUEST',
    },
    select: { id: true, email: true, role: true },
  })

  auditLog({
    userId: user.id,
    action: 'USER_REGISTERED',
    entity: 'User',
    entityId: user.id,
    ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
  })

  return NextResponse.json(
    { message: 'Account created successfully.', userId: user.id },
    { status: 201 }
  )
}
