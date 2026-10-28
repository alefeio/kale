import Link from "next/link"

export const instant = false
import { CreateInvitationForm } from "@/components/admin/CreateInvitationForm"
import { InvitationCopyButton } from "@/components/admin/InvitationCopyButton"
import { InvitationWhatsAppShare } from "@/components/admin/InvitationWhatsAppShare"
import { requireAdmin } from "@/lib/admin"
import { invitationShareText, invitationUrl } from "@/lib/invitation-link"
import { deriveAttendanceStatus } from "@/lib/db/mappers"
import { prisma } from "@/lib/db/prisma"

const statusLabel = {
  pending: "Pendente",
  confirmed: "Confirmado",
  declined: "Não irá",
} as const

function guestLabel(attending: boolean | null) {
  if (attending === null) return "Pendente"
  return attending ? "Confirmado" : "Não irá"
}

export default async function InvitationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  await requireAdmin()
  const { q = "" } = await searchParams
  const term = q.trim()
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
    },
  })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-4xl text-olive-dark sm:text-5xl">Convites</h1>
        <form className="mt-5 flex flex-col gap-3 sm:flex-row" action="/admin/convites">
          <label className="flex-1 text-sm text-brown">
            Buscar por nome, identificação ou código
            <input name="q" defaultValue={term} className="field mt-2" />
          </label>
          <button type="submit" className="btn btn-secondary self-end">
            Buscar
          </button>
        </form>
      </div>

      {invitations.length === 0 ? (
        <p className="text-brown">Nenhum convite cadastrado ainda.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {invitations.map((invitation) => {
            const status = deriveAttendanceStatus(invitation.guests)
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
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Link href={`/admin/convites/${invitation.id}`} className="btn btn-secondary w-full sm:w-auto">
                      Editar
                    </Link>
                    <InvitationCopyButton id={invitation.id} />
                    <InvitationWhatsAppShare
                      shareText={invitationShareText(url, invitation.code)}
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
