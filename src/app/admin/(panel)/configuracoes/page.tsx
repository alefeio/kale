export const instant = false

import { PixSettingsForm } from "@/components/admin/PixSettingsForm"
import { requireAdmin } from "@/lib/admin"
import { getWeddingSettings } from "@/services/wedding-settings"

export default async function SettingsPage() {
  await requireAdmin()
  const settings = await getWeddingSettings()

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="font-serif text-4xl text-olive-dark sm:text-5xl">Configurações</h1>
      <section className="border border-olive/10 bg-white p-4 sm:p-6">
        <h2 className="font-serif text-3xl text-olive-dark">PIX</h2>
        <div className="mt-5">
          <PixSettingsForm initial={settings} />
        </div>
      </section>
    </div>
  )
}
