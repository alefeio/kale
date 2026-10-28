import { AdminShell } from "@/components/admin/AdminShell"

export const instant = false
import { requireAdmin } from "@/lib/admin"

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin()
  return (
    <AdminShell name={session.user.name} email={session.user.email}>
      {children}
    </AdminShell>
  )
}
