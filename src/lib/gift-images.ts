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
  "jogo-de-pratos": "/images/gifts/jogo-de-pratos.webp",
  "jogo-de-copos": "/images/gifts/jogo-de-copos.webp",
  "jogo-de-canecas": "/images/gifts/jogo-de-canecas.webp",
  "jogo-de-talher": "/images/gifts/jogo-de-talher.webp",
  "tabua-de-cortar": "/images/gifts/tabua-de-cortar.webp",
  "potes-de-mantimentos": "/images/gifts/potes-de-mantimentos.webp",
  "porta-temperos": "/images/gifts/porta-temperos.webp",
  "jarras-para-agua": "/images/gifts/jarras-para-agua.webp",
  "tigelas-porcelana": "/images/gifts/tigelas-porcelana.webp",
  "jogo-de-panelas": "/images/gifts/jogo-de-panelas.webp",
  "jogo-americano": "/images/gifts/jogo-americano.webp",
  "toalhas-de-mesa-ou-centro-de-mesa": "/images/gifts/toalhas-de-mesa-ou-centro-de-mesa.webp",
  "guardanapos": "/images/gifts/guardanapos.webp",
  "toalhas-de-banho": "/images/gifts/toalhas-de-banho.webp",
  "lixeiras": "/images/gifts/lixeiras.webp",
  "jogo-de-cama-de-casal": "/images/gifts/jogo-de-cama-de-casal.webp",
  "tapete-de-sala": "/images/gifts/tapete-de-sala.webp",
  "tapete-de-banheiro": "/images/gifts/tapete-de-banheiro.webp",
} as const

export type GiftImageSlug = keyof typeof DEFAULT_GIFT_IMAGE_MANIFEST

/** Resolve custom DB image or default manifest path without requiring a production seed. */
export function resolvePublicGiftImage(
  slug: string,
  storedImage: string | null | undefined,
  availableLocalImages: Iterable<string> = [],
): string {
  const available = new Set(availableLocalImages)
  const custom = storedImage?.trim() ?? ""
  if (custom) {
    if (isRemoteGiftImage(custom)) return custom
    if (isLocalGiftImage(custom)) {
      if (available.size === 0 || available.has(custom)) return custom
    } else {
      return custom
    }
  }

  const fallback = DEFAULT_GIFT_IMAGE_MANIFEST[slug as GiftImageSlug]
  if (!fallback) return ""
  if (available.size === 0 || available.has(fallback)) return fallback
  return ""
}
