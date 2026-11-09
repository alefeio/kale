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

export type GiftImageSource = "custom" | "default" | "none"

export type GiftImagePresentation = {
  storedImage: string
  displayImage: string
  defaultImage: string
  imageSource: GiftImageSource
}

/**
 * Resolve the public gift image without requiring a production seed.
 * Custom DB values always win; missing files are handled by the UI fallback.
 */
export function resolvePublicGiftImage(
  slug: string,
  storedImage: string | null | undefined,
  availableLocalImages: Iterable<string> = [],
): string {
  return resolveGiftImagePresentation(slug, storedImage, availableLocalImages).displayImage
}

/**
 * Shared presentation for public catalog and Admin previews.
 * Does not write default manifest paths into the database.
 */
export function resolveGiftImagePresentation(
  slug: string,
  storedImage: string | null | undefined,
  availableLocalImages: Iterable<string> = [],
): GiftImagePresentation {
  const available = new Set(availableLocalImages)
  const fallback = DEFAULT_GIFT_IMAGE_MANIFEST[slug as GiftImageSlug]
  const defaultImage =
    fallback && (available.size === 0 || available.has(fallback)) ? fallback : ""

  const custom = storedImage?.trim() ?? ""
  if (custom) {
    return {
      storedImage: custom,
      displayImage: custom,
      defaultImage,
      imageSource: "custom",
    }
  }

  if (defaultImage) {
    return {
      storedImage: "",
      displayImage: defaultImage,
      defaultImage,
      imageSource: "default",
    }
  }

  return {
    storedImage: "",
    displayImage: "",
    defaultImage: "",
    imageSource: "none",
  }
}
