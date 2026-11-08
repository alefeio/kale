import { connection } from "next/server"
import { requireAdminApi } from "@/lib/admin"
import {
  buildAttendanceRows,
  filterAttendanceRows,
  formatAttendanceDate,
  guestAttendanceLabels,
  invitationActiveWhere,
  parseAttendanceQuery,
} from "@/lib/attendance"
import { toCsv } from "@/lib/csv"
import { prisma } from "@/lib/db/prisma"

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Belem",
})

export async function GET(request: Request) {
  await connection()
  const auth = await requireAdminApi()
  if (auth.error) return auth.error

  const url = new URL(request.url)
  const query = parseAttendanceQuery({
    status: url.searchParams.get("status") ?? undefined,
    active: url.searchParams.get("active") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
  })
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

  const rows = filterAttendanceRows(buildAttendanceRows(invitations), query)
  const csv = toCsv(
    ["Nome", "Convite", "Status", "Última resposta"],
    rows.map((row) => [
      row.guestName,
      row.invitationLabel,
      guestAttendanceLabels[row.status],
      formatAttendanceDate(row.lastResponseAt, dateFormat),
    ]),
  )

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="presencas.csv"',
      "Cache-Control": "no-store",
    },
  })
}
