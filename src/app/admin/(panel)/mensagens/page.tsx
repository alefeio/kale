import { MessageManager } from "@/components/admin/AdminManagers"

export const instant = false
import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/db/prisma"

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Belem",
})

export default async function MessagesPage() {
  await requireAdmin()
  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, message: true, createdAt: true },
  })

  return (
    <div>
      <h1 className="mb-6 font-serif text-4xl text-olive-dark sm:text-5xl">Mensagens</h1>
      <MessageManager
        messages={messages.map((message) => ({
          id: message.id,
          name: message.name,
          message: message.message,
          date: dateFormat.format(message.createdAt),
        }))}
      />
    </div>
  )
}
