import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { VendorTableClient } from '@/components/vendors/VendorTableClient'

export const metadata: Metadata = { title: 'Vendors' }

interface SearchParams {
  category?: string
  search?: string
  page?: string
}

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const params = await searchParams
  const page = parseInt(params.page ?? '1', 10)
  const limit = 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { isActive: true }
  if (params.category) where.category = params.category
  if (params.search) where.name = { contains: params.search }

  const [vendors, total] = await Promise.all([
    db.vendor.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    db.vendor.count({ where }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Vendors</h1>
        <p className="text-sm text-muted-foreground mt-1">{total} vendors in directory</p>
      </div>
      <VendorTableClient vendors={vendors} total={total} page={page} limit={limit} />
    </div>
  )
}
