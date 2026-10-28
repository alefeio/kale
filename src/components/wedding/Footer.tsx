import { weddingConfig } from "@/config/wedding"
import type { ResolvedWeddingSettings } from "@/lib/site-settings"

export function Footer({ site }: { site: ResolvedWeddingSettings }) {
  const { copy } = weddingConfig

  return (
    <footer className="border-t border-olive/10 px-5 py-12 text-center">
      <p className="font-script text-3xl break-words text-olive-dark">{site.couple.displayName}</p>
      <p className="mt-2 text-sm tracking-[0.22em] text-brown">{site.event.numericDate}</p>
      <p className="mt-6 text-xs text-brown">{copy.footerNote}</p>
    </footer>
  )
}
