import { notFound } from "next/navigation"

export const instant = false
import { InvitationEditor } from "@/components/admin/InvitationEditor"
import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/db/prisma"

export default async function InvitationPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const invitation = await prisma.invitation.findUnique({
    where: { id },
    select: {
      id: true,
      label: true,
      greeting: true,
      active: true,
      guests: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, attending: true },
      },
    },
  })
  if (!invitation) notFound()

  return (
    <div>
      <h1 className="mb-6 font-serif text-4xl text-olive-dark">{invitation.label}</h1>
      <InvitationEditor invitation={{ ...invitation, greeting: invitation.greeting ?? "" }} />
    </div>
  )
}
