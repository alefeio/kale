import { giftCategoryLabels, type Gift } from "@/types/gift"

function gift(
  partial: Omit<Gift, "categoryLabel" | "status"> & { status?: Gift["status"] },
): Gift {
  return {
    ...partial,
    categoryLabel: giftCategoryLabels[partial.category] ?? partial.category,
    status: partial.status ?? "available",
  }
}

export const giftSeeds: Gift[] = [
  gift({
    id: "jogo-de-panelas",
    name: "Jogo de panelas",
    category: "cozinha",
    image: "/images/gifts/jogo-de-panelas.jpg",
    description: "Para os almoços de domingo.",
  }),
  gift({
    id: "jogo-de-pratos",
    name: "Jogo de pratos",
    category: "mesa",
    image: "/images/gifts/jogo-de-pratos.jpg",
    description: "Um serviço simples para a mesa nova.",
  }),
  gift({
    id: "jogo-de-talheres",
    name: "Jogo de talheres",
    category: "mesa",
    image: "/images/gifts/jogo-de-talheres.jpg",
  }),
  gift({
    id: "jogo-de-copos",
    name: "Jogo de copos",
    category: "mesa",
    image: "/images/gifts/jogo-de-copos.jpg",
  }),
  gift({
    id: "jogo-de-tacas",
    name: "Jogo de taças",
    category: "mesa",
    image: "/images/gifts/jogo-de-tacas.jpg",
    description: "Para brindar com calma.",
  }),
  gift({
    id: "liquidificador",
    name: "Liquidificador",
    category: "eletros",
    image: "/images/gifts/liquidificador.jpg",
  }),
  gift({
    id: "sanduicheira",
    name: "Sanduicheira",
    category: "eletros",
    image: "/images/gifts/sanduicheira.jpg",
    status: "reserved",
  }),
  gift({
    id: "cafeteira",
    name: "Cafeteira",
    category: "eletros",
    image: "/images/gifts/cafeteira.jpg",
    description: "O café da manhã da casa nova.",
  }),
  gift({
    id: "jogo-de-cama",
    name: "Jogo de cama",
    category: "casa",
    image: "/images/gifts/jogo-de-cama.jpg",
  }),
  gift({
    id: "jogo-de-toalhas",
    name: "Jogo de toalhas",
    category: "banho",
    image: "/images/gifts/jogo-de-toalhas.jpg",
    status: "reserved",
  }),
  gift({
    id: "kit-de-utensilios",
    name: "Kit de utensílios",
    category: "cozinha",
    image: "/images/gifts/kit-de-utensilios.jpg",
  }),
  gift({
    id: "assadeira",
    name: "Assadeira",
    category: "cozinha",
    image: "/images/gifts/assadeira.jpg",
    description: "Para o bolo de sempre.",
  }),
]
