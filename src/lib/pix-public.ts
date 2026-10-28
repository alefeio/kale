import { buildPixBrCode } from "@/lib/pix-brcode"
import type { PixKeyType } from "@/lib/pix-key"

export type PublicPixSettings = {
  pixEnabled: boolean
  pixKeyType: PixKeyType | null
  pixKey: string | null
  pixReceiver: string | null
  pixCity: string | null
}

export function publicPixContent(settings: PublicPixSettings) {
  if (!settings.pixEnabled || !settings.pixKeyType || !settings.pixKey || !settings.pixReceiver || !settings.pixCity) {
    return null
  }

  return {
    key: settings.pixKey,
    receiver: settings.pixReceiver,
    payload: buildPixBrCode(settings.pixKey, settings.pixReceiver, settings.pixCity),
  }
}
