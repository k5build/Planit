'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createVendorSchema, type CreateVendorInput } from '@/lib/validations/vendor'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyResolver = any
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Dropdown'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { useRouter } from 'next/navigation'
import { Plus, Search, Star } from 'lucide-react'

interface Vendor {
  id: string
  name: string
  category: string
  description: string | null
  website: string | null
  rating: number | null
  reviewCount: number
  isVerified: boolean
  priceRangeMin: number | null
  priceRangeMax: number | null
  currency: string
}

interface VendorTableClientProps {
  vendors: Vendor[]
  total: number
  page: number
  limit: number
}

const CATEGORIES = [
  { value: 'CATERING', label: 'Catering' },
  { value: 'PHOTOGRAPHY', label: 'Photography' },
  { value: 'VIDEOGRAPHY', label: 'Videography' },
  { value: 'MUSIC', label: 'Music' },
  { value: 'FLORIST', label: 'Florist' },
  { value: 'DECORATION', label: 'Decoration' },
  { value: 'LIGHTING', label: 'Lighting' },
  { value: 'AUDIO_VISUAL', label: 'Audio Visual' },
  { value: 'TRANSPORTATION', label: 'Transportation' },
  { value: 'SECURITY', label: 'Security' },
  { value: 'CLEANING', label: 'Cleaning' },
  { value: 'ENTERTAINMENT', label: 'Entertainment' },
  { value: 'VENUE', label: 'Venue' },
  { value: 'OFFICIANT', label: 'Officiant' },
  { value: 'STATIONERY', label: 'Stationery' },
  { value: 'OTHER', label: 'Other' },
]

export function VendorTableClient({ vendors, total, page, limit }: VendorTableClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateVendorInput>({
    resolver: zodResolver(createVendorSchema) as AnyResolver,
    defaultValues: { category: 'OTHER', currency: 'USD' },
  })

  const filtered = search
    ? vendors.filter((v) => v.name.toLowerCase().includes(search.toLowerCase()))
    : vendors

  async function onSubmit(data: CreateVendorInput) {
    setServerError('')
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        setServerError(json.error ?? 'Failed to add vendor.')
        return
      }
      reset()
      setAddOpen(false)
      router.refresh()
    } catch {
      setServerError('Network error.')
    }
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors..."
            className="w-full pl-9 pr-4 h-9 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/55 focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add Vendor
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((vendor) => (
          <div
            key={vendor.id}
            className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-interactive"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  {vendor.category.replace('_', ' ')}
                </p>
                <h3 className="text-sm font-semibold text-foreground mt-0.5">{vendor.name}</h3>
              </div>
              {vendor.isVerified && (
                <Badge variant="success">Verified</Badge>
              )}
            </div>

            {vendor.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{vendor.description}</p>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {vendor.rating !== null && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-accent fill-current" aria-hidden="true" />
                  {vendor.rating.toFixed(1)} ({vendor.reviewCount})
                </span>
              )}
              {vendor.priceRangeMin !== null && (
                <span>
                  {vendor.currency} {vendor.priceRangeMin.toLocaleString()}
                  {vendor.priceRangeMax ? ` – ${vendor.priceRangeMax.toLocaleString()}` : '+'}
                </span>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-20 text-sm text-muted-foreground">
            No vendors found. Add your first vendor.
          </div>
        )}
      </div>

      {/* Add Vendor Modal */}
      <Modal
        open={addOpen}
        onClose={() => { setAddOpen(false); reset(); setServerError('') }}
        title="Add Vendor"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Input
                label="Vendor Name"
                placeholder="e.g. The Photo Studio"
                error={errors.name?.message}
                {...register('name')}
              />
            </div>
            <Select
              label="Category"
              options={CATEGORIES}
              error={errors.category?.message}
              {...register('category')}
            />
            <Input
              label="Website"
              type="url"
              placeholder="https://"
              {...register('website')}
            />
          </div>
          <Textarea
            label="Description"
            placeholder="Brief description of this vendor..."
            rows={3}
            {...register('description')}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email" type="email" placeholder="contact@vendor.com" {...register('email')} />
            <Input label="Phone" type="tel" placeholder="+1 555 000 0000" {...register('phone')} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Min Price"
              type="number"
              min={0}
              {...register('priceRangeMin', { valueAsNumber: true })}
            />
            <Input
              label="Max Price"
              type="number"
              min={0}
              {...register('priceRangeMax', { valueAsNumber: true })}
            />
            <Select
              label="Currency"
              options={[
                { value: 'USD', label: 'USD' },
                { value: 'EUR', label: 'EUR' },
                { value: 'GBP', label: 'GBP' },
                { value: 'AED', label: 'AED' },
              ]}
              {...register('currency')}
            />
          </div>

          {serverError && (
            <p role="alert" className="text-xs text-destructive">{serverError}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => { setAddOpen(false); reset() }}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Add Vendor
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
