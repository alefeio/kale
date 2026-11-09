import { notFound } from "next/navigation"

export const instant = false
import { InvitationEditor } from "@/components/admin/InvitationEditor"
import { requireAdmin } from "@/lib/admin"
import { formatAttendanceDate } from "@/lib/attendance"
import { invitationShareText, invitationUrl } from "@/lib/invitation-link"
import { summarizeInvitationVisits } from "@/lib/invitation-visits"
import { deriveAttendanceStatus } from "@/lib/db/mappers"
import { prisma } from "@/lib/db/prisma"
import { getResolvedWeddingSettings } from "@/services/wedding-settings"

const statusLabel = {
  pending: "Pendente",
  confirmed: "Confirmado",
  declined: "Não irá",
} as const

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Belem",
})

export default async function InvitationPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const invitation = await prisma.invitation.findUnique({
    where: { id },
    select: {
      id: true,
      token: true,
      code: true,
      label: true,
      greeting: true,
      active: true,
      guests: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, whatsapp: true, attending: true },
      },
      visits: {
        orderBy: { visitedAt: "desc" },
        take: 20,
        select: { id: true, visitedAt: true },
      },
    },
  })
  if (!invitation) notFound()
  const site = await getResolvedWeddingSettings()
  const url = invitationUrl(invitation.token)
  const summary = summarizeInvitationVisits(invitation.visits)
  const status = deriveAttendanceStatus(invitation.guests)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-2 font-serif text-4xl text-olive-dark">{invitation.label}</h1>
        <p className="text-sm text-brown">Confirmação atual: {statusLabel[status]}</p>
      </div>

      <section className="border border-olive/10 bg-white p-4 sm:p-6" aria-labelledby="acessos-titulo">
        <h2 id="acessos-titulo" className="font-serif text-3xl text-olive-dark">
          Acessos ao convite
        </h2>
        <p className="mt-2 text-sm text-brown">
          Visitas registradas da abertura do link. Em convites familiares, não identificamos qual pessoa abriu.
        </p>
        <dl className="mt-5 grid gap-3 text-sm text-brown sm:grid-cols-3">
          <div>
            <dt>Primeira visualização</dt>
            <dd className="mt-1 font-serif text-xl text-olive-dark">
              {summary.firstVisitedAt ? formatAttendanceDate(summary.firstVisitedAt, dateFormat) : "Ainda não"}
            </dd>
          </div>
          <div>
            <dt>Última visualização</dt>
            <dd className="mt-1 font-serif text-xl text-olive-dark">
              {summary.lastVisitedAt ? formatAttendanceDate(summary.lastVisitedAt, dateFormat) : "Ainda não"}
            </dd>
          </div>
          <div>
            <dt>Quantidade total</dt>
            <dd className="mt-1 font-serif text-xl text-olive-dark">{summary.count}</dd>
          </div>
        </dl>
        {invitation.visits.length > 0 ? (
          <ul className="mt-6 flex flex-col gap-2 text-sm text-brown">
            {invitation.visits.map((visit) => (
              <li key={visit.id} className="flex justify-between gap-4 border-t border-olive/10 pt-2">
                <span>Visita registrada</span>
                <span>{formatAttendanceDate(visit.visitedAt, dateFormat)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-sm text-brown">Nenhuma visita registrada ainda.</p>
        )}
      </section>

      <InvitationEditor
        invitation={{
          id: invitation.id,
          label: invitation.label,
          greeting: invitation.greeting ?? "",
          active: invitation.active,
          guests: invitation.guests,
          share: {
            url,
            code: invitation.code,
            shareText: invitationShareText(url, invitation.code, {
              displayName: site.couple.displayName,
              dateLabel: site.event.dateLabel,
            }),
          },
        }}
      />
    </div>
  )
}
