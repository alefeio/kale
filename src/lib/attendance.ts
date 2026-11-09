export type GuestAttendanceStatus = "confirmed" | "declined" | "pending"
export type InvitationActiveFilter = "active" | "inactive" | "all"
export type AttendanceStatusFilter = "all" | GuestAttendanceStatus

export const guestAttendanceLabels: Record<GuestAttendanceStatus, string> = {
  confirmed: "Confirmado",
  declined: "Não irá",
  pending: "Pendente",
}

export function guestAttendanceStatus(attending: boolean | null): GuestAttendanceStatus {
  if (attending === true) return "confirmed"
  if (attending === false) return "declined"
  return "pending"
}

export type AttendanceInvitationSource = {
  id: string
  label: string
  active: boolean
  guests: Array<{
    id: string
    name: string
    attending: boolean | null
    sortOrder: number
  }>
  response: { updatedAt: Date } | null
}

export type AttendanceRow = {
  guestId: string
  guestName: string
  invitationId: string
  invitationLabel: string
  invitationActive: boolean
  status: GuestAttendanceStatus
  lastResponseAt: Date | null
}

export type AttendanceSummary = {
  guests: number
  confirmed: number
  declined: number
  pending: number
  invitations: number
  invitationsResponded: number
}

export type AttendanceQuery = {
  status: AttendanceStatusFilter
  active: InvitationActiveFilter
  q: string
}

export function parseAttendanceQuery(input: {
  status?: string
  active?: string
  q?: string
}): AttendanceQuery {
  const statusRaw = (input.status ?? "all").trim().toLowerCase()
  const status: AttendanceStatusFilter =
    statusRaw === "confirmed" || statusRaw === "declined" || statusRaw === "pending"
      ? statusRaw
      : "all"

  const activeRaw = (input.active ?? "active").trim().toLowerCase()
  const active: InvitationActiveFilter =
    activeRaw === "all" || activeRaw === "inactive" || activeRaw === "active" ? activeRaw : "active"

  return {
    status,
    active,
    q: (input.q ?? "").trim(),
  }
}

export function invitationActiveWhere(active: InvitationActiveFilter) {
  if (active === "all") return undefined
  return active === "active"
}

export function buildAttendanceRows(invitations: AttendanceInvitationSource[]): AttendanceRow[] {
  const rows: AttendanceRow[] = []
  for (const invitation of invitations) {
    const guests = [...invitation.guests].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "pt-BR"))
    for (const guest of guests) {
      rows.push({
        guestId: guest.id,
        guestName: guest.name,
        invitationId: invitation.id,
        invitationLabel: invitation.label,
        invitationActive: invitation.active,
        status: guestAttendanceStatus(guest.attending),
        lastResponseAt: invitation.response?.updatedAt ?? null,
      })
    }
  }
  return rows
}

export function filterAttendanceRows(rows: AttendanceRow[], query: AttendanceQuery): AttendanceRow[] {
  const term = query.q.toLocaleLowerCase("pt-BR")
  return rows.filter((row) => {
    if (query.status !== "all" && row.status !== query.status) return false
    if (!term) return true
    return (
      row.guestName.toLocaleLowerCase("pt-BR").includes(term) ||
      row.invitationLabel.toLocaleLowerCase("pt-BR").includes(term)
    )
  })
}

export function summarizeAttendance(
  rows: AttendanceRow[],
  invitations: Array<{ id: string; response: { updatedAt: Date } | null }>,
): AttendanceSummary {
  let confirmed = 0
  let declined = 0
  let pending = 0
  for (const row of rows) {
    if (row.status === "confirmed") confirmed += 1
    else if (row.status === "declined") declined += 1
    else pending += 1
  }
  return {
    guests: rows.length,
    confirmed,
    declined,
    pending,
    invitations: invitations.length,
    invitationsResponded: invitations.filter((invitation) => invitation.response).length,
  }
}

export function groupAttendanceRows(rows: AttendanceRow[]) {
  const groups = new Map<
    string,
    {
      invitationId: string
      invitationLabel: string
      invitationActive: boolean
      lastResponseAt: Date | null
      guests: AttendanceRow[]
    }
  >()

  for (const row of rows) {
    const current = groups.get(row.invitationId)
    if (current) {
      current.guests.push(row)
      continue
    }
    groups.set(row.invitationId, {
      invitationId: row.invitationId,
      invitationLabel: row.invitationLabel,
      invitationActive: row.invitationActive,
      lastResponseAt: row.lastResponseAt,
      guests: [row],
    })
  }

  return [...groups.values()]
}

export function formatAttendanceDate(value: Date | null, formatter: Intl.DateTimeFormat): string {
  return value ? formatter.format(value) : "—"
}
