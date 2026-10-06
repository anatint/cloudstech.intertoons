import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { verifySession, ADMIN_SESSION_COOKIE } from '@/lib/adminAuth'

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const secret = process.env.ADMIN_SESSION_SECRET
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value
  const session = secret ? await verifySession(token, secret) : null
  if (!session) redirect('/admin')

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}
