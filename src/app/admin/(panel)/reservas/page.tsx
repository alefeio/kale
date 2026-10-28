import { ReservationManager } from "@/components/admin/AdminManagers"
import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/db/prisma"

export const instant = false

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Belem",
})

export default async function ReservationsPage() {
  await requireAdmin()
  const reservations = await prisma.giftReservation.findMany({
    orderBy: { reservedAt: "desc" },
    select: {
      id: true,
      donorName: true,
      donorContact: true,
      message: true,
      reservedAt: true,
      gift: { select: { name: true } },
      invitation: { select: { label: true } },
    },
  })

  return (
    <div>
      <h1 className="mb-6 font-serif text-4xl text-olive-dark sm:text-5xl">Reservas</h1>
      <ReservationManager
        reservations={reservations.map((reservation) => ({
          id: reservation.id,
          gift: reservation.gift.name,
          donorName: reservation.donorName,
          donorContact: reservation.donorContact ?? "",
          invitation: reservation.invitation?.label ?? "—",
          origin: reservation.invitation ? "Convite" : "Site",
          date: dateFormat.format(reservation.reservedAt),
          message: reservation.message ?? "",
        }))}
      />
    </div>
  )
}
