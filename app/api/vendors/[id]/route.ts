import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { encrypt, hmacHash } from '@/lib/crypto'
import { updateVendorSchema } from '@/lib/validations/vendor'
import { auditLog } from '@/lib/audit'

interface RouteContext {
  params: Promise<{ id: string }>
}

const ALLOWED_ROLES = ['SUPER_ADMIN', 'PLANNER', 'OPERATIONS']

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  const vendor = await db.vendor.findUnique({ where: { id } })
  if (!vendor) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = updateVendorSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 }
    )
  }

  const { email, phone, address, tags, website, ...rest } = parsed.data

  const updateData: Record<string, unknown> = { ...rest }

  if (website !== undefined) {
    updateData.website = website || null
  }
  if (email !== undefined) {
    updateData.emailEncrypted = encrypt(email)
    updateData.emailHash = hmacHash(email)
  }
  if (phone !== undefined) {
    updateData.phoneEncrypted = encrypt(phone)
    updateData.phoneHash = hmacHash(phone)
  }
  if (address !== undefined) {
    updateData.addressEncrypted = encrypt(address)
  }
  if (tags !== undefined) {
    updateData.tags = JSON.stringify(tags)
  }

  const updated = await db.vendor.update({
    where: { id },
    data: updateData,
  })

  auditLog({
    userId: session.user.id,
    action: 'VENDOR_UPDATED',
    entity: 'Vendor',
    entityId: id,
    metadata: { name: updated.name },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  const vendor = await db.vendor.findUnique({ where: { id } })
  if (!vendor) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Soft-delete: mark as inactive rather than destroying data
  await db.vendor.update({
    where: { id },
    data: { isActive: false },
  })

  auditLog({
    userId: session.user.id,
    action: 'VENDOR_DELETED',
    entity: 'Vendor',
    entityId: id,
    metadata: { name: vendor.name },
  })

  return new NextResponse(null, { status: 204 })
}
