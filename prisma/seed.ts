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
  { slug: "jogo-de-pratos", name: "Jogo de pratos", category: "TABLE", sortOrder: 1 },
  { slug: "jogo-de-copos", name: "Jogo de copos", category: "TABLE", sortOrder: 2 },
  { slug: "jogo-de-canecas", name: "Jogo de canecas", category: "TABLE", sortOrder: 3 },
  { slug: "jogo-de-talher", name: "Jogo de talher", category: "TABLE", sortOrder: 4 },
  { slug: "tabua-de-cortar", name: "Tábua de cortar", category: "KITCHEN", sortOrder: 5 },
  { slug: "potes-de-mantimentos", name: "Potes de mantimentos", category: "KITCHEN", sortOrder: 6 },
  { slug: "porta-temperos", name: "Porta temperos", category: "KITCHEN", sortOrder: 7 },
  { slug: "jarras-para-agua", name: "Jarras para água", category: "TABLE", sortOrder: 8 },
  { slug: "tigelas-porcelana", name: "Tigelas porcelana", category: "TABLE", sortOrder: 9 },
  { slug: "jogo-de-panelas", name: "Jogo de panelas", category: "KITCHEN", sortOrder: 10 },
  { slug: "jogo-americano", name: "Jogo americano", category: "TABLE", sortOrder: 11 },
  { slug: "toalhas-de-mesa-ou-centro-de-mesa", name: "Toalhas de mesa ou centro de mesa", category: "TABLE", sortOrder: 12 },
  { slug: "guardanapos", name: "Guardanapos", category: "TABLE", sortOrder: 13 },
  { slug: "toalhas-de-banho", name: "Toalhas de banho", category: "BATH", sortOrder: 14 },
  { slug: "lixeiras", name: "Lixeiras", category: "HOME", sortOrder: 15 },
  { slug: "jogo-de-cama-de-casal", name: "Jogo de cama de casal", category: "HOME", sortOrder: 16 },
  { slug: "tapete-de-sala", name: "Tapete de sala", category: "HOME", sortOrder: 17 },
  { slug: "tapete-de-banheiro", name: "Tapete de banheiro", category: "BATH", sortOrder: 18 },
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
  for (const gift of gifts) {
    await prisma.gift.upsert({
      where: { slug: gift.slug },
      update: {
        name: gift.name,
        category: gift.category,
        description: null,
        image: null,
        sortOrder: gift.sortOrder,
        active: true,
      },
      create: {
        slug: gift.slug,
        name: gift.name,
        category: gift.category,
        description: null,
        image: null,
        sortOrder: gift.sortOrder,
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

