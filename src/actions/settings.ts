"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/admin"
import { validatePixSettings } from "@/lib/pix-key"
import { saveWeddingSettings } from "@/services/wedding-settings"

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
