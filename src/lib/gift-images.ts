export function isRemoteGiftImage(src: string) {
  return /^https:\/\//i.test(src.trim())
}

export function isLocalGiftImage(src: string) {
  return src.trim().startsWith("/images/gifts/")
}

/** Accept local gift assets and approved remote https URLs. */
export function isDisplayableGiftImage(src: string, availableLocalImages: Iterable<string>) {
  const value = src.trim()
  if (!value) return false
  if (isRemoteGiftImage(value)) return true
  if (isLocalGiftImage(value)) return new Set(availableLocalImages).has(value)
  return false
}

export const DEFAULT_GIFT_IMAGE_MANIFEST = {
  "jogo-de-pratos": "/images/gifts/jogo-de-pratos.jpg",
  "jogo-de-copos": "/images/gifts/jogo-de-copos.jpg",
  "jogo-de-canecas": "/images/gifts/jogo-de-canecas.jpg",
  "jogo-de-talher": "/images/gifts/jogo-de-talher.jpg",
  "tabua-de-cortar": "/images/gifts/tabua-de-cortar.jpg",
  "potes-de-mantimentos": "/images/gifts/potes-de-mantimentos.jpg",
  "porta-temperos": "/images/gifts/porta-temperos.jpg",
  "jarras-para-agua": "/images/gifts/jarras-para-agua.jpg",
  "tigelas-porcelana": "/images/gifts/tigelas-porcelana.jpg",
  "jogo-de-panelas": "/images/gifts/jogo-de-panelas.jpg",
  "jogo-americano": "/images/gifts/jogo-americano.jpg",
  "toalhas-de-mesa-ou-centro-de-mesa": "/images/gifts/toalhas-de-mesa-ou-centro-de-mesa.jpg",
  "guardanapos": "/images/gifts/guardanapos.jpg",
  "toalhas-de-banho": "/images/gifts/toalhas-de-banho.jpg",
  "lixeiras": "/images/gifts/lixeiras.jpg",
  "jogo-de-cama-de-casal": "/images/gifts/jogo-de-cama-de-casal.jpg",
  "tapete-de-sala": "/images/gifts/tapete-de-sala.jpg",
  "tapete-de-banheiro": "/images/gifts/tapete-de-banheiro.jpg",
} as const

export type GiftImageSlug = keyof typeof DEFAULT_GIFT_IMAGE_MANIFEST
