import { prisma } from "@/lib/db/prisma"
import type { PixKeyType } from "@/lib/pix-key"
import { resolveWeddingSettings } from "@/lib/site-settings"

export { publicPixContent } from "@/lib/pix-public"

export const WEDDING_SETTINGS_ID = "wedding"

export type WeddingSettingsView = {
  pixEnabled: boolean
  pixKeyType: PixKeyType | null
  pixKey: string | null
  pixReceiver: string | null
  pixCity: string
}

const emptySettings: WeddingSettingsView = {
  pixEnabled: false,
  pixKeyType: null,
  pixKey: null,
  pixReceiver: null,
  pixCity: "BELEM",
}

async function loadRow() {
  return prisma.weddingSettings.findUnique({ where: { id: WEDDING_SETTINGS_ID } })
}

export async function getWeddingSettings(): Promise<WeddingSettingsView> {
  const row = await loadRow()
  if (!row) return emptySettings
  return {
    pixEnabled: row.pixEnabled,
    pixKeyType: row.pixKeyType,
    pixKey: row.pixKey,
    pixReceiver: row.pixReceiver,
    pixCity: row.pixCity ?? "BELEM",
  }
}

export async function getResolvedWeddingSettings() {
  const row = await loadRow()
  return resolveWeddingSettings(row)
}

async function updateFields(data: Record<string, unknown>) {
  await prisma.weddingSettings.upsert({
    where: { id: WEDDING_SETTINGS_ID },
    create: { id: WEDDING_SETTINGS_ID, ...data },
    update: data,
  })
}

export async function saveWeddingSettings(data: {
  pixEnabled: boolean
  pixKeyType: PixKeyType | null
  pixKey: string | null
  pixReceiver: string | null
  pixCity: string | null
}) {
  await updateFields(data)
}

export async function saveIdentityAndHeroSettings(data: {
  brideName: string
  groomName: string
  heroPositionX: number
  heroPositionY: number
  heroHeightMobile: number
  heroHeightTablet: number
  heroHeightDesktop: number
}) {
  await updateFields(data)
}

export async function saveHeroImage(data: { heroImageUrl: string; heroImagePublicId: string }) {
  await updateFields(data)
}

export async function saveThemeSettings(data: {
  colorIvory: string
  colorCream: string
  colorPrimary: string
  colorPrimaryDark: string
  colorAccent: string
  colorTextMuted: string
  colorText: string
  colorHeroBase: string
}) {
  await updateFields(data)
}

export async function saveEventAndVenueSettings(data: {
  eventAt: Date
  eventTimezone: string
  venueName: string
  venueAddress: string
  venueNeighborhood: string
  venueCity: string
  venueState: string
}) {
  await updateFields(data)
}

export async function saveFaithSettings(data: {
  faithTitle: string
  faithText: string
  verseText: string
  verseReference: string
}) {
  await updateFields(data)
}

