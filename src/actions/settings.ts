"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/admin"
import { uploadPublicSiteImage } from "@/lib/apimg"
import { validatePixSettings } from "@/lib/pix-key"
import {
  validateEventAndVenue,
  validateFaith,
  validateIdentityAndHero,
  validateTheme,
  type WeddingColors,
} from "@/lib/site-settings"
import {
  saveEventAndVenueSettings,
  saveFaithSettings,
  saveHeroImage,
  saveIdentityAndHeroSettings,
  saveThemeSettings,
  saveWeddingSettings,
} from "@/services/wedding-settings"

function revalidateSite() {
  revalidatePath("/", "layout")
  revalidatePath("/convite/[token]", "page")
  revalidatePath("/admin/configuracoes")
}

export async function savePixSettings(input: {
  pixEnabled: boolean
  pixKeyType: string
  pixKey: string
  pixReceiver: string
  pixCity: string
}) {
  await requireAdmin()
  const parsed = validatePixSettings(input)
  if (!parsed.ok) return { ok: false as const, error: parsed.error }

  await saveWeddingSettings(parsed.data)
  revalidatePath("/")
  revalidatePath("/admin/configuracoes")
  return { ok: true as const, message: "Configurações do PIX salvas." }
}

export async function saveIdentityAndHero(input: {
  brideName: string
  groomName: string
  heroPositionX: number
  heroPositionY: number
  heroHeightMobile: number
  heroHeightTablet: number
  heroHeightDesktop: number
}) {
  await requireAdmin()
  const parsed = validateIdentityAndHero(input)
  if (!parsed.ok) return { ok: false as const, error: parsed.error }
  await saveIdentityAndHeroSettings(parsed.data)
  revalidateSite()
  return { ok: true as const, message: "Identidade salva." }
}

export async function saveTheme(input: WeddingColors) {
  await requireAdmin()
  const parsed = validateTheme(input)
  if (!parsed.ok) return { ok: false as const, error: parsed.error }
  await saveThemeSettings(parsed.data)
  revalidateSite()
  return { ok: true as const, message: "Cores salvas." }
}

export async function saveEventAndVenue(input: {
  date: string
  time: string
  venueName: string
  venueAddress: string
  venueNeighborhood: string
  venueCity: string
  venueState: string
}) {
  await requireAdmin()
  const parsed = validateEventAndVenue(input)
  if (!parsed.ok) return { ok: false as const, error: parsed.error }
  await saveEventAndVenueSettings(parsed.data)
  revalidateSite()
  return { ok: true as const, message: "Evento e local salvos." }
}

export async function saveFaith(input: {
  faithTitle: string
  faithText: string
  verseText: string
  verseReference: string
}) {
  await requireAdmin()
  const parsed = validateFaith(input)
  if (!parsed.ok) return { ok: false as const, error: parsed.error }
  await saveFaithSettings(parsed.data)
  revalidateSite()
  return { ok: true as const, message: "Segunda seção salva." }
}

export async function uploadHeroImage(formData: FormData) {
  await requireAdmin()
  const file = formData.get("file")
  if (!(file instanceof File)) return { ok: false as const, error: "Selecione uma imagem." }

  const uploaded = await uploadPublicSiteImage(file)
  if (!uploaded.ok) return { ok: false as const, error: uploaded.error }

  await saveHeroImage({ heroImageUrl: uploaded.url, heroImagePublicId: uploaded.publicId })
  revalidateSite()
  return { ok: true as const, message: "Foto do Hero atualizada.", url: uploaded.url }
}
