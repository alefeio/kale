export const instant = false

import { SettingsScreen } from "@/components/admin/SettingsScreen"
import { requireAdmin } from "@/lib/admin"
import { getResolvedWeddingSettings } from "@/services/wedding-settings"
import { getWeddingSettings } from "@/services/wedding-settings"

export default async function SettingsPage() {
  await requireAdmin()
  const [site, pix] = await Promise.all([getResolvedWeddingSettings(), getWeddingSettings()])

  return <SettingsScreen site={site} pix={pix} />
}
