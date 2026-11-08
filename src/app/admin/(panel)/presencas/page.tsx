import Link from "next/link"
import { requireAdmin } from "@/lib/admin"
import {
  buildAttendanceRows,
  filterAttendanceRows,
  formatAttendanceDate,
  groupAttendanceRows,
  guestAttendanceLabels,
  invitationActiveWhere,
  parseAttendanceQuery,
  summarizeAttendance,
  type AttendanceStatusFilter,
  type InvitationActiveFilter,
} from "@/lib/attendance"
import { prisma } from "@/lib/db/prisma"

export const instant = false

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Belem",
})

const statusFilters: Array<{ value: AttendanceStatusFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "confirmed", label: "Confirmados" },
  { value: "declined", label: "Não irão" },
  { value: "pending", label: "Pendentes" },
]

const activeFilters: Array<{ value: InvitationActiveFilter; label: string }> = [
  { value: "active", label: "Convites ativos" },
  { value: "inactive", label: "Convites inativos" },
  { value: "all", label: "Ativos e inativos" },
]

function hrefFor(query: { status: string; active: string; q: string }) {
  const params = new URLSearchParams()
  if (query.status !== "all") params.set("status", query.status)
  if (query.active !== "active") params.set("active", query.active)
  if (query.q) params.set("q", query.q)
  const qs = params.toString()
  return qs ? `/admin/presencas?${qs}` : "/admin/presencas"
}

function exportHref(query: { status: string; active: string; q: string }) {
  const params = new URLSearchParams()
  if (query.status !== "all") params.set("status", query.status)
  if (query.active !== "active") params.set("active", query.active)
  if (query.q) params.set("q", query.q)
  const qs = params.toString()
  return qs ? `/api/admin/attendance/export?${qs}` : "/api/admin/attendance/export"
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; active?: string; q?: string }>
}) {
  await requireAdmin()
  const raw = await searchParams
  const query = parseAttendanceQuery(raw)
  const activeValue = invitationActiveWhere(query.active)

  const invitations = await prisma.invitation.findMany({
    where: activeValue === undefined ? undefined : { active: activeValue },
    orderBy: { label: "asc" },
    select: {
      id: true,
      label: true,
      active: true,
      guests: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, attending: true, sortOrder: true },
      },
      response: { select: { updatedAt: true } },
    },
  })

  const allRows = buildAttendanceRows(invitations)
  const summary = summarizeAttendance(allRows, invitations)
  const filteredRows = filterAttendanceRows(allRows, query)
  const groups = groupAttendanceRows(filteredRows)

  const cards = [
    ["Total de convidados", summary.guests],
    ["Confirmados", summary.confirmed],
    ["Não irão", summary.declined],
    ["Aguardando resposta", summary.pending],
    ["Total de convites", summary.invitations],
    ["Convites com resposta", summary.invitationsResponded],
  ] as const

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-serif text-4xl text-olive-dark sm:text-5xl">Presenças</h1>
          <p className="mt-3 max-w-2xl text-brown">
            Visão somente leitura das respostas por convidado. Totais usam o estado individual de cada
            pessoa e, por padrão, consideram apenas convites ativos.
          </p>
        </div>
        <a href={exportHref(query)} className="btn btn-secondary self-start">
          Exportar CSV
        </a>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value]) => (
          <li key={label} className="border border-olive/10 bg-white px-4 py-5">
            <p className="text-sm text-brown">{label}</p>
            <p className="mt-2 font-serif text-4xl text-olive-dark">{value}</p>
          </li>
        ))}
      </ul>
      <p className="text-sm text-brown">
        Conferência: {summary.confirmed} + {summary.declined} + {summary.pending} = {summary.guests}{" "}
        convidados
      </p>

      <form className="flex flex-col gap-4 border border-olive/10 bg-white p-4" action="/admin/presencas">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <label className="text-sm text-brown">
            Pesquisar por nome do convidado ou identificação do convite
            <input name="q" defaultValue={query.q} className="field mt-2" />
          </label>
          <button type="submit" className="btn btn-secondary self-end">
            Aplicar
          </button>
        </div>

        <fieldset>
          <legend className="text-sm text-brown">Situação</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {statusFilters.map((item) => (
              <label key={item.value} className="inline-flex items-center gap-2 text-sm text-olive-dark">
                <input
                  type="radio"
                  name="status"
                  value={item.value}
                  defaultChecked={query.status === item.value}
                />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm text-brown">Convites</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {activeFilters.map((item) => (
              <label key={item.value} className="inline-flex items-center gap-2 text-sm text-olive-dark">
                <input
                  type="radio"
                  name="active"
                  value={item.value}
                  defaultChecked={query.active === item.value}
                />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>
      </form>

      <div className="flex flex-wrap gap-3 text-sm">
        {statusFilters.map((item) => (
          <Link
            key={item.value}
            href={hrefFor({ ...query, status: item.value })}
            className={query.status === item.value ? "text-olive-dark underline" : "text-brown"}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {groups.length === 0 ? (
        <p className="text-brown">Nenhum convidado encontrado com os filtros atuais.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {groups.map((group) => (
            <li key={group.invitationId} className="border border-olive/10 bg-white p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-serif text-3xl text-olive-dark">{group.invitationLabel}</h2>
                  <p className="mt-1 text-sm text-brown">
                    {group.invitationActive ? "Convite ativo" : "Convite inativo"} · Última resposta do
                    convite: {formatAttendanceDate(group.lastResponseAt, dateFormat)}
                  </p>
                </div>
                <Link href={`/admin/convites/${group.invitationId}`} className="btn btn-ghost self-start">
                  Abrir convite
                </Link>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-brown">
                    <tr>
                      <th className="py-2 pr-4 font-medium">Convidado</th>
                      <th className="py-2 pr-4 font-medium">Situação</th>
                      <th className="py-2 font-medium">Última resposta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.guests.map((guest) => (
                      <tr key={guest.guestId} className="border-t border-olive/10 text-olive-dark">
                        <td className="py-3 pr-4">{guest.guestName}</td>
                        <td className="py-3 pr-4">{guestAttendanceLabels[guest.status]}</td>
                        <td className="py-3 text-brown">
                          {formatAttendanceDate(guest.lastResponseAt, dateFormat)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
