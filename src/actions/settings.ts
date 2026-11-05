"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/admin"
import { uploadPublicSiteImage } from "@/lib/apimg"
import { validatePixSettings } from "@/lib/pix-key"
import {
  validateAdditionalEventLocation,
  validateEventAndVenue,
  validateFaith,
  validateIdentityAndHero,
  validateTheme,
  type WeddingColors,
} from "@/lib/site-settings"
import {
  guardAdditionalLocationId,
  guardReorderAdditionalLocationIds,
} from "@/lib/event-location-guards"
import {
  createEventLocation,
  deleteEventLocation,
  reorderEventLocations,
  saveEventAndVenueSettings,
  saveFaithSettings,
  saveHeroImage,
  saveIdentityAndHeroSettings,
  saveThemeSettings,
  saveWeddingSettings,
  setEventLocationActive,
  updateEventLocation,
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

export async function createAdditionalEventLocation(input: {
  type: string
  title: string
  venueName: string
  venueAddress: string
  venueNeighborhood: string
  venueCity: string
  venueState: string
  description: string
  startMode: string
  date: string
  time: string
  mapsUrl: string
  active: boolean
}) {
  await requireAdmin()
  const parsed = validateAdditionalEventLocation(input)
  if (!parsed.ok) return { ok: false as const, error: parsed.error }
  await createEventLocation(parsed.data)
  revalidateSite()
  return { ok: true as const, message: "Local adicional criado." }
}

export async function updateAdditionalEventLocation(
  id: string,
  input: {
    type: string
    title: string
    venueName: string
    venueAddress: string
    venueNeighborhood: string
    venueCity: string
    venueState: string
    description: string
    startMode: string
    date: string
    time: string
    mapsUrl: string
    active: boolean
    sortOrder?: number
  },
) {
  await requireAdmin()
  const locked = guardAdditionalLocationId(id, "update")
  if (!locked.ok) return { ok: false as const, error: locked.error }
  const parsed = validateAdditionalEventLocation(input)
  if (!parsed.ok) return { ok: false as const, error: parsed.error }
  try {
    await updateEventLocation(id, parsed.data)
  } catch (error) {
    if (error instanceof Error && error.message === "PRIMARY_LOCKED") {
      return { ok: false as const, error: "O evento principal não pode ser alterado por esta ação." }
    }
    return { ok: false as const, error: "Não encontramos este local." }
  }
  revalidateSite()
  return { ok: true as const, message: "Local adicional atualizado." }
}

export async function toggleAdditionalEventLocation(id: string, active: boolean) {
  await requireAdmin()
  const locked = guardAdditionalLocationId(id, "deactivate")
  if (!locked.ok) return { ok: false as const, error: locked.error }
  try {
    await setEventLocationActive(id, active)
  } catch (error) {
    if (error instanceof Error && error.message === "PRIMARY_LOCKED") {
      return { ok: false as const, error: "O evento principal não pode ser desativado." }
    }
    return { ok: false as const, error: "Não encontramos este local." }
  }
  revalidateSite()
  return { ok: true as const, message: active ? "Local ativado." : "Local desativado." }
}

export async function reorderAdditionalEventLocations(orderedIds: string[]) {
  await requireAdmin()
  const order = guardReorderAdditionalLocationIds(orderedIds)
  if (!order.ok) return { ok: false as const, error: order.error }
  try {
    await reorderEventLocations(order.ids)
  } catch {
    return { ok: false as const, error: "Não foi possível reordenar os locais." }
  }
  revalidateSite()
  return { ok: true as const, message: "Ordem atualizada." }
}

export async function removeAdditionalEventLocation(id: string) {
  await requireAdmin()
  const locked = guardAdditionalLocationId(id, "delete")
  if (!locked.ok) return { ok: false as const, error: locked.error }
  try {
    await deleteEventLocation(id)
  } catch (error) {
    if (error instanceof Error && error.message === "PRIMARY_LOCKED") {
      return { ok: false as const, error: locked.error }
    }
    return { ok: false as const, error: "Não encontramos este local." }
  }
  revalidateSite()
  return { ok: true as const, message: "Local adicional excluído." }
}
