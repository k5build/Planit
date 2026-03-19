'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createBudgetItemSchema, type CreateBudgetItemInput } from '@/lib/validations/budget'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyResolver = any
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Dropdown'
import { Modal } from '@/components/ui/Modal'
import { Card } from '@/components/ui/Card'
import { formatCurrency, percentOf } from '@/lib/utils'
import { Plus, DollarSign } from 'lucide-react'

interface BudgetItem {
  id: string
  category: string
  name: string
  planned: number
  actual: number | null
  currency: string
}

interface BudgetClientProps {
  events: { id: string; title: string }[]
  selectedEventId?: string
  budgetItems: BudgetItem[]
  byCategory: Record<string, BudgetItem[]>
  summary: { planned: number; actual: number }
}

const BUDGET_CATEGORIES = [
  { value: 'VENUE', label: 'Venue' },
  { value: 'CATERING', label: 'Catering' },
  { value: 'MUSIC', label: 'Music' },
  { value: 'PHOTOGRAPHY', label: 'Photography' },
  { value: 'FLORIST', label: 'Florist' },
  { value: 'DECORATION', label: 'Decoration' },
  { value: 'TRANSPORTATION', label: 'Transportation' },
  { value: 'STAFFING', label: 'Staffing' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'PRINTING', label: 'Printing' },
  { value: 'TECHNOLOGY', label: 'Technology' },
  { value: 'MISCELLANEOUS', label: 'Miscellaneous' },
]

export function BudgetClient({
  events,
  selectedEventId,
  budgetItems,
  byCategory,
  summary,
}: BudgetClientProps) {
  const router = useRouter()
  const [addOpen, setAddOpen] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateBudgetItemInput>({
    resolver: zodResolver(createBudgetItemSchema) as AnyResolver,
    defaultValues: {
      eventId: selectedEventId ?? '',
      category: 'MISCELLANEOUS',
      currency: 'USD',
    },
  })

  const remaining = summary.planned - summary.actual
  const spentPercent = percentOf(summary.actual, summary.planned)

  async function onSubmit(data: CreateBudgetItemInput) {
    setServerError('')
    try {
      const res = await fetch('/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        setServerError(json.error ?? 'Failed to add item.')
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
      {/* Event Selector */}
      {events.length > 1 && (
        <div className="flex items-center gap-3">
          <Select
            label="Select Event"
            options={events.map((e) => ({ value: e.id, label: e.title }))}
            value={selectedEventId}
            onChange={(e) => {
              router.push(`/dashboard/budget?eventId=${e.target.value}`)
            }}
          />
        </div>
      )}

      {!selectedEventId ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border ">
          <DollarSign className="h-10 w-10 text-muted-foreground/40 mb-4" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">No event selected</p>
          <p className="text-xs text-muted-foreground mt-1">Select an event above to manage its budget</p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border border-border">
            {[
              { label: 'TOTAL BUDGET', value: formatCurrency(summary.planned) },
              { label: 'SPENT',        value: formatCurrency(summary.actual) },
              { label: 'REMAINING',    value: formatCurrency(remaining), color: remaining >= 0 ? 'var(--success)' : 'var(--destructive)' },
            ].map((card, i) => (
              <div
                key={card.label}
                className="py-7 px-6"
                style={{ borderRight: i < 2 ? '1px solid var(--border)' : undefined }}
              >
                <p
                  className="text-xs tracking-[0.18em] uppercase text-muted-foreground mb-2"
                  style={{ fontFamily: 'Courier New, monospace' }}
                >
                  {card.label}
                </p>
                <p
                  className="text-3xl sm:text-4xl font-light text-foreground"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: card.color ?? 'var(--foreground)' }}
                >
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          {summary.planned > 0 && (
            <div className="border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <p
                  className="text-xs tracking-[0.15em] uppercase text-muted-foreground"
                  style={{ fontFamily: 'Courier New, monospace' }}
                >
                  BUDGET UTILIZATION
                </p>
                <p
                  className="text-xs text-foreground"
                  style={{ fontFamily: 'Courier New, monospace' }}
                >
                  {spentPercent}%
                </p>
              </div>
              <div className="h-1 bg-muted overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${Math.min(spentPercent, 100)}%`,
                    backgroundColor: spentPercent > 90
                      ? 'var(--destructive)'
                      : spentPercent > 70
                      ? 'var(--primary)'
                      : 'var(--success)',
                  }}
                  role="progressbar"
                  aria-valuenow={spentPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end">
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Expense
            </Button>
          </div>

          {/* By Category */}
          {Object.entries(byCategory).map(([category, items]) => {
            const catPlanned = items.reduce((s, i) => s + i.planned, 0)
            const catActual = items.reduce((s, i) => s + (i.actual ?? 0), 0)

            return (
              <Card key={category} padding="none">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {category.replace('_', ' ')}
                    </p>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      {formatCurrency(catActual)} / {formatCurrency(catPlanned)} planned
                    </p>
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/20">
                      <th className="px-5 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Item</th>
                      <th className="px-5 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Planned</th>
                      <th className="px-5 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Actual</th>
                      <th className="px-5 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const variance = (item.actual ?? 0) - item.planned
                      return (
                        <tr key={item.id} className="border-b border-border/50 hover:bg-secondary/20 transition-interactive">
                          <td className="px-5 py-3 font-medium text-foreground">{item.name}</td>
                          <td className="px-5 py-3 text-right text-muted-foreground text-xs">
                            {formatCurrency(item.planned, item.currency)}
                          </td>
                          <td className="px-5 py-3 text-right hidden sm:table-cell text-xs">
                            {item.actual !== null ? formatCurrency(item.actual, item.currency) : '—'}
                          </td>
                          <td className="px-5 py-3 text-right hidden sm:table-cell text-xs">
                            {item.actual !== null ? (
                              <span style={{ color: variance > 0 ? 'hsl(var(--destructive))' : 'hsl(var(--success))' }}>
                                {variance > 0 ? '+' : ''}{formatCurrency(variance, item.currency)}
                              </span>
                            ) : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </Card>
            )
          })}

          {budgetItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border ">
              <p className="text-sm text-muted-foreground">No budget items yet. Add your first expense.</p>
            </div>
          )}
        </>
      )}

      {/* Add Item Modal */}
      <Modal
        open={addOpen}
        onClose={() => { setAddOpen(false); reset(); setServerError('') }}
        title="Add Budget Item"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('eventId')} />
          <Select
            label="Category"
            options={BUDGET_CATEGORIES}
            error={errors.category?.message}
            {...register('category')}
          />
          <Input
            label="Item Name"
            placeholder="e.g. Venue deposit"
            error={errors.name?.message}
            {...register('name')}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Planned Amount"
              type="number"
              min={0}
              step={0.01}
              error={errors.planned?.message}
              {...register('planned', { valueAsNumber: true })}
            />
            <Input
              label="Actual Amount"
              type="number"
              min={0}
              step={0.01}
              placeholder="Leave blank if not paid"
              {...register('actual', { valueAsNumber: true })}
            />
          </div>
          <Input label="Notes" placeholder="Optional notes..." {...register('notes')} />

          {serverError && (
            <p role="alert" className="text-xs text-destructive">{serverError}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => { setAddOpen(false); reset() }}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Add Item
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
