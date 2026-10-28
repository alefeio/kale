import { prisma } from "@/lib/db/prisma"

export const instant = false
import { requireAdmin } from "@/lib/admin"

export default async function DashboardPage() {
  await requireAdmin()
  const [invitations, guests, confirmed, declined, pending, availableGifts, reservedGifts, messages] = await Promise.all([
    prisma.invitation.count(),
    prisma.guest.count(),
    prisma.guest.count({ where: { attending: true } }),
    prisma.guest.count({ where: { attending: false } }),
    prisma.guest.count({ where: { attending: null } }),
    prisma.gift.count({ where: { active: true, reservation: { is: null } } }),
    prisma.giftReservation.count(),
    prisma.message.count(),
  ])
  const responded = confirmed + declined

  const cards = [
    ["Total de convites", invitations],
    ["Total de convidados", guests],
    ["Confirmados", confirmed],
    ["Não irão", declined],
    ["Pendentes", pending],
    ["Presentes disponíveis", availableGifts],
    ["Presentes reservados", reservedGifts],
    ["Mensagens recebidas", messages],
  ] as const

  return (
    <div>
      <h1 className="font-serif text-4xl text-olive-dark sm:text-5xl">Visão geral</h1>
      <p className="mt-3 text-brown">
        RSVP
        <span className="mt-1 block">
          {responded} de {guests} convidados responderam
        </span>
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <li key={label} className="border border-olive/10 bg-white px-4 py-5">
            <p className="text-sm text-brown">{label}</p>
            <p className="mt-2 font-serif text-4xl text-olive-dark">{value}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
