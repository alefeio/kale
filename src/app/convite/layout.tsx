import type { Metadata } from "next"
import { SiteProvider } from "@/components/wedding/site-context"
import { weddingSiteStyle } from "@/lib/site-settings"
import { getResolvedWeddingSettings } from "@/services/wedding-settings"

export const instant = false

export async function generateMetadata(): Promise<Metadata> {
  const site = await getResolvedWeddingSettings()
  return {
    title: { absolute: `Convite — ${site.couple.displayName}` },
    robots: "noindex,nofollow",
  }
}

export default async function ConviteLayout({ children }: { children: React.ReactNode }) {
  const site = await getResolvedWeddingSettings()
  return (
    <SiteProvider site={site}>
      <div className="wedding-site relative min-h-[100dvh] overflow-hidden" style={weddingSiteStyle(site)}>
        {children}
      </div>
    </SiteProvider>
  )
}
