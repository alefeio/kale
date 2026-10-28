import { publicPixContent, getWeddingSettings } from "@/services/wedding-settings"
import { PixSection } from "@/components/wedding/PixSection"

export async function PixSectionGate() {
  const pix = publicPixContent(await getWeddingSettings())
  return <PixSection pix={pix} />
}
