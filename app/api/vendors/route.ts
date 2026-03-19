import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { encrypt, hmacHash } from '@/lib/crypto'
import { createVendorSchema, vendorQuerySchema } from '@/lib/validations/vendor'
import { auditLog } from '@/lib/audit'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const parsed = vendorQuerySchema.safeParse(Object.fromEntries(searchParams))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 422 })
  }

  const { category, search, page, limit } = parsed.data
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { isActive: true }
  if (category) where.category = category
  if (search) where.name = { contains: search }

  const [vendors, total] = await Promise.all([
    db.vendor.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    db.vendor.count({ where }),
  ])

  return NextResponse.json({
    vendors,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!['SUPER_ADMIN', 'PLANNER', 'OPERATIONS'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = createVendorSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 }
    )
  }

  const { email, phone, address, tags, website, ...rest } = parsed.data

  const vendor = await db.vendor.create({
    data: {
      ...rest,
      website: website || undefined,
      emailEncrypted: email ? encrypt(email) : undefined,
      emailHash: email ? hmacHash(email) : undefined,
      phoneEncrypted: phone ? encrypt(phone) : undefined,
      phoneHash: phone ? hmacHash(phone) : undefined,
      addressEncrypted: address ? encrypt(address) : undefined,
      tags: tags ? JSON.stringify(tags) : undefined,
    },
  })

  auditLog({
    userId: session.user.id,
    action: 'VENDOR_CREATED',
    entity: 'Vendor',
    entityId: vendor.id,
  })

  return NextResponse.json(vendor, { status: 201 })
}
