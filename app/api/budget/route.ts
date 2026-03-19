import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createBudgetItemSchema } from '@/lib/validations/budget'
import { auditLog } from '@/lib/audit'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const eventId = searchParams.get('eventId')

  if (!eventId) {
    return NextResponse.json({ error: 'eventId is required' }, { status: 422 })
  }

  const items = await db.budgetItem.findMany({
    where: { eventId },
    orderBy: { category: 'asc' },
  })

  const planned = items.reduce((sum, i) => sum + i.planned, 0)
  const actual = items.reduce((sum, i) => sum + (i.actual ?? 0), 0)

  return NextResponse.json({ items, summary: { planned, actual, remaining: planned - actual } })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = createBudgetItemSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 422 }
    )
  }

  const item = await db.budgetItem.create({ data: parsed.data })

  auditLog({
    userId: session.user.id,
    action: 'BUDGET_ITEM_CREATED',
    entity: 'BudgetItem',
    entityId: item.id,
    metadata: { category: item.category, planned: item.planned },
  })

  return NextResponse.json(item, { status: 201 })
}
