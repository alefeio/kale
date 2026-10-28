import type { InvitationSeed } from "@/types/invitation"

export const invitationSeeds: InvitationSeed[] = [
  {
    token: "demo-casal",
    label: "Carlos e Helena",
    greeting: "Ficaremos muito felizes em celebrar este momento com vocês.",
    guests: [
      { id: "carlos", name: "Carlos Mendes" },
      { id: "helena", name: "Helena Mendes" },
    ],
  },
  {
    token: "demo-familia",
    label: "Família Silva",
    greeting: "Será uma alegria celebrar este momento com vocês.",
    guests: [
      { id: "ana", name: "Ana Silva" },
      { id: "joao", name: "João Silva" },
      { id: "pedro", name: "Pedro Silva" },
    ],
  },
  {
    token: "demo-individual",
    label: "Beatriz Lima",
    greeting: "Ficaremos muito felizes em celebrar este momento com você.",
    guests: [{ id: "beatriz", name: "Beatriz Lima" }],
  },
]
