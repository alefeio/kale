import Link from "next/link"

export const instant = false
import { CreateInvitationForm } from "@/components/admin/CreateInvitationForm"
import { InvitationCopyButton } from "@/components/admin/InvitationCopyButton"
import { InvitationWhatsAppShare } from "@/components/admin/InvitationWhatsAppShare"
import { requireAdmin } from "@/lib/admin"
import { formatAttendanceDate } from "@/lib/attendance"
import { invitationShareText, invitationUrl } from "@/lib/invitation-link"
import {
  invitationVisitViewState,
  isViewedWithoutResponse,
  summarizeInvitationVisits,
} from "@/lib/invitation-visits"
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

function guestLabel(attending: boolean | null) {
  if (attending === null) return "Pendente"
  return attending ? "Confirmado" : "Não irá"
}

export default async function InvitationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; view?: string }>
}) {
  await requireAdmin()
  const { q = "", view = "all" } = await searchParams
  const site = await getResolvedWeddingSettings()
  const term = q.trim()
  const viewFilter = view === "viewed-pending" ? "viewed-pending" : "all"
  const invitations = await prisma.invitation.findMany({
    where: term
      ? {
          OR: [
            { label: { contains: term, mode: "insensitive" } },
            { code: { contains: term.toUpperCase(), mode: "insensitive" } },
            { guests: { some: { name: { contains: term, mode: "insensitive" } } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      label: true,
      code: true,
      active: true,
      token: true,
      guests: {
        orderBy: { sortOrder: "asc" },
        select: { name: true, attending: true, whatsapp: true },
      },
      response: { select: { respondedAt: true } },
      visits: {
        orderBy: { visitedAt: "desc" },
        select: { visitedAt: true },
      },
    },
  })

  const rows = invitations
    .map((invitation) => {
      const summary = summarizeInvitationVisits(invitation.visits)
      const status = deriveAttendanceStatus(invitation.guests)
      return {
        invitation,
        summary,
        status,
        viewState: invitationVisitViewState(summary.count),
        viewedPending: isViewedWithoutResponse({
          visitCount: summary.count,
          guests: invitation.guests,
        }),
      }
    })
    .filter((row) => (viewFilter === "viewed-pending" ? row.viewedPending : true))

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-4xl text-olive-dark sm:text-5xl">Convites</h1>
        <form className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap" action="/admin/convites">
          <label className="min-w-[16rem] flex-1 text-sm text-brown">
            Buscar por nome, identificação ou código
            <input name="q" defaultValue={term} className="field mt-2" />
          </label>
          <label className="text-sm text-brown">
            Visualização
            <select name="view" defaultValue={viewFilter} className="field mt-2">
              <option value="all">Todos</option>
              <option value="viewed-pending">Visualizados sem resposta</option>
            </select>
          </label>
          <button type="submit" className="btn btn-secondary self-end">
            Filtrar
          </button>
        </form>
      </div>

      {rows.length === 0 ? (
        <p className="text-brown">Nenhum convite encontrado para este filtro.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map(({ invitation, summary, status, viewState }) => {
            const url = invitationUrl(invitation.token)
            return (
              <li key={invitation.id} className="border border-olive/10 bg-white p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="font-serif text-3xl text-olive-dark">{invitation.label}</h2>
                    <p className="mt-2 text-sm text-brown">Código: {invitation.code}</p>
                    <p className="mt-1 text-sm text-brown">
                      {invitation.guests.length} convidado{invitation.guests.length === 1 ? "" : "s"} ·{" "}
                      {invitation.active ? "Ativo" : "Inativo"} · {statusLabel[status]}
                    </p>
                    <p className="mt-1 text-sm text-brown">
                      Resposta: {invitation.response ? "Recebida" : "Ainda não"}
                    </p>
                    <p className="mt-1 text-sm text-brown">
                      Acesso: {viewState === "never" ? "Nunca visualizado" : "Visualizado"}
                      {summary.count > 0
                        ? ` · ${summary.count} visita${summary.count === 1 ? "" : "s"} · última ${formatAttendanceDate(summary.lastVisitedAt, dateFormat)}`
                        : ""}
                    </p>
                    <p className="mt-1 text-xs text-brown/80">
                      A visita refere-se à abertura do convite, não a uma pessoa específica da família.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Link href={`/admin/convites/${invitation.id}`} className="btn btn-secondary w-full sm:w-auto">
                      Editar
                    </Link>
                    <InvitationCopyButton id={invitation.id} />
                    <InvitationWhatsAppShare
                      shareText={invitationShareText(url, invitation.code, {
                        displayName: site.couple.displayName,
                        dateLabel: site.event.dateLabel,
                      })}
                      guests={invitation.guests}
                      label="WhatsApp"
                    />
                  </div>
                </div>
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-olive-dark">Ver convidados</summary>
                  <ul className="mt-3 flex flex-col gap-2 text-sm text-brown">
                    {invitation.guests.map((guest, index) => (
                      <li key={`${guest.name}-${index}`} className="flex justify-between gap-4">
                        <span>{guest.name}</span>
                        <span>{guestLabel(guest.attending)}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            )
          })}
        </ul>
      )}

      <CreateInvitationForm />
    </div>
  )
}
