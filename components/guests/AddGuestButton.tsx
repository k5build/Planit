'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export function AddGuestButton() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleClick() {
    const params = new URLSearchParams(searchParams.toString())
    params.set('addGuest', '1')
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <button
      onClick={handleClick}
      type="button"
      aria-label="Add a new guest"
      className="border border-foreground px-6 py-2.5 text-xs tracking-[0.15em] uppercase text-foreground hover:bg-foreground hover:text-background transition-all duration-200 cursor-pointer"
      style={{ fontFamily: 'Courier New, monospace' }}
    >
      ( ADD GUEST )
    </button>
  )
}
