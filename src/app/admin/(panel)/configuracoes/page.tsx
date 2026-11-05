export const instant = false

import { SettingsScreen } from "@/components/admin/SettingsScreen"
import { requireAdmin } from "@/lib/admin"
import {
  getResolvedWeddingSettings,
  getWeddingSettings,
  listEventLocationsForAdmin,
} from "@/services/wedding-settings"

export default async function SettingsPage() {
  await requireAdmin()
  const [site, pix, additionalLocations] = await Promise.all([
    getResolvedWeddingSettings(),
    getWeddingSettings(),
    listEventLocationsForAdmin(),
  ])

  return <SettingsScreen site={site} pix={pix} additionalLocations={additionalLocations} />
}
