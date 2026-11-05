import { prisma } from "@/lib/db/prisma"
import {
  assertServiceAdditionalLocationId,
  guardReorderAdditionalLocationIds,
} from "@/lib/event-location-guards"
import type { PixKeyType } from "@/lib/pix-key"
import {
  resolveWeddingSettings,
  type EventLocationRow,
  type EventLocationTypeValue,
  type EventStartModeValue,
} from "@/lib/site-settings"

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

function mapLocation(row: {
  id: string
  type: EventLocationTypeValue
  title: string
  venueName: string
  venueAddress: string | null
  venueNeighborhood: string | null
  venueCity: string
  venueState: string
  description: string | null
  startMode: EventStartModeValue
  startsAt: Date | null
  mapsUrl: string | null
  sortOrder: number
  active: boolean
}): EventLocationRow {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    venueName: row.venueName,
    venueAddress: row.venueAddress,
    venueNeighborhood: row.venueNeighborhood,
    venueCity: row.venueCity,
    venueState: row.venueState,
    description: row.description,
    startMode: row.startMode,
    startsAt: row.startsAt,
    mapsUrl: row.mapsUrl,
    sortOrder: row.sortOrder,
    active: row.active,
  }
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

export async function listEventLocationsForAdmin() {
  const rows = await prisma.weddingEventLocation.findMany({
    where: { weddingSettingsId: WEDDING_SETTINGS_ID },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  })
  return rows.map(mapLocation)
}

export async function getResolvedWeddingSettings() {
  const [row, locations] = await Promise.all([
    loadRow(),
    prisma.weddingEventLocation.findMany({
      where: { weddingSettingsId: WEDDING_SETTINGS_ID, active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
  ])
  return resolveWeddingSettings(row, locations.map(mapLocation))
}

async function ensureWeddingSettingsRow() {
  await prisma.weddingSettings.upsert({
    where: { id: WEDDING_SETTINGS_ID },
    create: { id: WEDDING_SETTINGS_ID },
    update: {},
  })
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

export type AdditionalLocationInput = {
  type: EventLocationTypeValue
  title: string
  venueName: string
  venueAddress: string | null
  venueNeighborhood: string | null
  venueCity: string
  venueState: string
  description: string | null
  startMode: EventStartModeValue
  startsAt: Date | null
  mapsUrl: string | null
  active: boolean
  sortOrder: number
}

export async function createEventLocation(data: AdditionalLocationInput) {
  await ensureWeddingSettingsRow()
  const max = await prisma.weddingEventLocation.aggregate({
    where: { weddingSettingsId: WEDDING_SETTINGS_ID },
    _max: { sortOrder: true },
  })
  // Always append; sortOrder 0 must not collapse into a falsy overwrite of existing rows.
  const sortOrder = (max._max.sortOrder ?? -1) + 1
  return prisma.weddingEventLocation.create({
    data: {
      weddingSettingsId: WEDDING_SETTINGS_ID,
      ...data,
      sortOrder,
    },
  })
}

export async function updateEventLocation(id: string, data: AdditionalLocationInput) {
  assertServiceAdditionalLocationId(id)
  const existing = await prisma.weddingEventLocation.findFirst({
    where: { id, weddingSettingsId: WEDDING_SETTINGS_ID },
    select: { id: true, sortOrder: true },
  })
  if (!existing) throw new Error("NOT_FOUND")
  return prisma.weddingEventLocation.update({
    where: { id },
    data: {
      ...data,
      // Preserve current order unless the caller explicitly provided sortOrder (>= 0).
      sortOrder: Number.isInteger(data.sortOrder) ? data.sortOrder : existing.sortOrder,
    },
  })
}

export async function setEventLocationActive(id: string, active: boolean) {
  assertServiceAdditionalLocationId(id)
  const existing = await prisma.weddingEventLocation.findFirst({
    where: { id, weddingSettingsId: WEDDING_SETTINGS_ID },
    select: { id: true },
  })
  if (!existing) throw new Error("NOT_FOUND")
  return prisma.weddingEventLocation.update({
    where: { id },
    data: { active },
  })
}

export async function reorderEventLocations(orderedIds: string[]) {
  const guarded = guardReorderAdditionalLocationIds(orderedIds)
  if (!guarded.ok) throw new Error("INVALID_ORDER")
  const existing = await prisma.weddingEventLocation.findMany({
    where: { weddingSettingsId: WEDDING_SETTINGS_ID },
    select: { id: true },
  })
  const known = new Set(existing.map((row) => row.id))
  if (guarded.ids.length !== known.size || guarded.ids.some((id) => !known.has(id))) {
    throw new Error("INVALID_ORDER")
  }
  await prisma.$transaction(
    guarded.ids.map((id, index) =>
      prisma.weddingEventLocation.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  )
}

export async function deleteEventLocation(id: string) {
  assertServiceAdditionalLocationId(id)
  const existing = await prisma.weddingEventLocation.findFirst({
    where: { id, weddingSettingsId: WEDDING_SETTINGS_ID },
    select: { id: true },
  })
  if (!existing) throw new Error("NOT_FOUND")
  await prisma.weddingEventLocation.delete({ where: { id } })
}
