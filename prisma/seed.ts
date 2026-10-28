import { config as loadEnv } from "dotenv"

loadEnv({ path: ".env.local", quiet: true })
loadEnv({ path: ".env", quiet: true })

async function main() {
  const { prisma } = await import("../src/lib/db/prisma")
  await seedGifts(prisma)
  await seedDemoInvitations(prisma)
  await prisma.$disconnect()
}

main().catch(() => {
  console.error("Falha ao executar o seed.")
  process.exit(1)
})

const gifts = [
  { slug: "jogo-de-panelas", name: "Jogo de panelas", category: "KITCHEN", description: "Para os almoços de domingo.", image: "/images/gifts/jogo-de-panelas.jpg" },
  { slug: "jogo-de-pratos", name: "Jogo de pratos", category: "TABLE", description: "Um serviço simples para a mesa nova.", image: "/images/gifts/jogo-de-pratos.jpg" },
  { slug: "jogo-de-talheres", name: "Jogo de talheres", category: "TABLE", image: "/images/gifts/jogo-de-talheres.jpg" },
  { slug: "jogo-de-copos", name: "Jogo de copos", category: "TABLE", image: "/images/gifts/jogo-de-copos.jpg" },
  { slug: "jogo-de-tacas", name: "Jogo de taças", category: "TABLE", description: "Para brindar com calma.", image: "/images/gifts/jogo-de-tacas.jpg" },
  { slug: "liquidificador", name: "Liquidificador", category: "APPLIANCES", image: "/images/gifts/liquidificador.jpg" },
  { slug: "sanduicheira", name: "Sanduicheira", category: "APPLIANCES", image: "/images/gifts/sanduicheira.jpg" },
  { slug: "cafeteira", name: "Cafeteira", category: "APPLIANCES", description: "O café da manhã da casa nova.", image: "/images/gifts/cafeteira.jpg" },
  { slug: "jogo-de-cama", name: "Jogo de cama", category: "HOME", image: "/images/gifts/jogo-de-cama.jpg" },
  { slug: "jogo-de-toalhas", name: "Jogo de toalhas", category: "BATH", image: "/images/gifts/jogo-de-toalhas.jpg" },
  { slug: "kit-de-utensilios", name: "Kit de utensílios", category: "KITCHEN", image: "/images/gifts/kit-de-utensilios.jpg" },
  { slug: "assadeira", name: "Assadeira", category: "KITCHEN", description: "Para o bolo de sempre.", image: "/images/gifts/assadeira.jpg" },
] as const

const demoInvitations = [
  {
    token: "demo-individual",
    label: "Beatriz Lima",
    greeting: "Ficaremos muito felizes em celebrar este momento com você.",
    guests: ["Beatriz Lima"],
  },
  {
    token: "demo-casal",
    label: "Carlos e Helena",
    greeting: "Ficaremos muito felizes em celebrar este momento com vocês.",
    guests: ["Carlos Mendes", "Helena Mendes"],
  },
  {
    token: "demo-familia",
    label: "Família Silva",
    greeting: "Será uma alegria celebrar este momento com vocês.",
    guests: ["Ana Silva", "João Silva", "Pedro Silva"],
  },
]

async function seedGifts(prisma: Awaited<typeof import("../src/lib/db/prisma")>["prisma"]) {
  for (const [index, gift] of gifts.entries()) {
    await prisma.gift.upsert({
      where: { slug: gift.slug },
      update: {
        name: gift.name,
        category: gift.category,
        description: "description" in gift ? gift.description : null,
        image: gift.image,
        sortOrder: index,
        active: true,
      },
      create: {
        slug: gift.slug,
        name: gift.name,
        category: gift.category,
        description: "description" in gift ? gift.description : null,
        image: gift.image,
        sortOrder: index,
      },
    })
  }
}

async function seedDemoInvitations(prisma: Awaited<typeof import("../src/lib/db/prisma")>["prisma"]) {
  if (process.env.SEED_DEMO_DATA !== "true") return

  for (const invitation of demoInvitations) {
    const existing = await prisma.invitation.findUnique({
      where: { token: invitation.token },
      select: { id: true },
    })
    if (existing) continue

    await prisma.invitation.create({
      data: {
        token: invitation.token,
        label: invitation.label,
        greeting: invitation.greeting,
        guests: {
          create: invitation.guests.map((name, index) => ({
            name,
            sortOrder: index,
          })),
        },
      },
    })
  }
}

