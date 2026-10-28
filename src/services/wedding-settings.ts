import { prisma } from "@/lib/db/prisma"
import type { PixKeyType } from "@/lib/pix-key"

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

export async function getWeddingSettings(): Promise<WeddingSettingsView> {
  const row = await prisma.weddingSettings.findUnique({ where: { id: WEDDING_SETTINGS_ID } })
  if (!row) return emptySettings
  return {
    pixEnabled: row.pixEnabled,
    pixKeyType: row.pixKeyType,
    pixKey: row.pixKey,
    pixReceiver: row.pixReceiver,
    pixCity: row.pixCity ?? "BELEM",
  }
}

export async function saveWeddingSettings(data: {
  pixEnabled: boolean
  pixKeyType: PixKeyType | null
  pixKey: string | null
  pixReceiver: string | null
  pixCity: string | null
}) {
  await prisma.weddingSettings.upsert({
    where: { id: WEDDING_SETTINGS_ID },
    create: { id: WEDDING_SETTINGS_ID, ...data },
    update: data,
  })
}

