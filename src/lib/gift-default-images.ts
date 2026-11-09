import { DEFAULT_GIFT_IMAGE_MANIFEST } from "@/lib/gift-images"

export type GiftDefaultImageReport = {
  found: string[]
  updatable: string[]
  ignoredCustom: string[]
  missing: string[]
}

export function planGiftDefaultImages(
  gifts: Array<{ slug: string; image: string | null }>,
  manifest: Record<string, string> = DEFAULT_GIFT_IMAGE_MANIFEST,
): GiftDefaultImageReport {
  const bySlug = new Map(gifts.map((gift) => [gift.slug, gift]))
  const report: GiftDefaultImageReport = {
    found: [],
    updatable: [],
    ignoredCustom: [],
    missing: [],
  }

  for (const slug of Object.keys(manifest)) {
    const gift = bySlug.get(slug)
    if (!gift) {
      report.missing.push(slug)
      continue
    }
    report.found.push(slug)
    if (gift.image && gift.image.trim()) {
      report.ignoredCustom.push(slug)
      continue
    }
    report.updatable.push(slug)
  }

  return report
}
