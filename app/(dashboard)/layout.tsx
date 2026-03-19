import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <Sidebar
        userEmail={session.user.email}
        userRole={session.user.role}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          userEmail={session.user.email}
          userRole={session.user.role}
        />

        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--background)' }}>
          <div className="p-6 sm:p-10 max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
