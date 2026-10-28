import { Suspense } from "react"
import type { Metadata } from "next"
import { EventDetails } from "@/components/wedding/EventDetails"
import { FaithSection } from "@/components/wedding/FaithSection"
import { FAQ } from "@/components/wedding/FAQ"
import { FinalSection } from "@/components/wedding/FinalSection"
import { Footer } from "@/components/wedding/Footer"
import { GiftList } from "@/components/wedding/GiftList"
import { Hero } from "@/components/wedding/Hero"
import { HomeShell } from "@/components/wedding/HomeShell"
import { MessageSection } from "@/components/wedding/MessageSection"
import { PixSectionGate } from "@/components/wedding/PixSectionGate"
import { RSVPCallToAction } from "@/components/wedding/RSVPCallToAction"
import { SiteProvider } from "@/components/wedding/site-context"
import { weddingConfig } from "@/config/wedding"
import { existingGiftImages } from "@/lib/media"
import { metadataTitle, weddingSiteStyle } from "@/lib/site-settings"
import { getResolvedWeddingSettings } from "@/services/wedding-settings"

export const instant = false

export async function generateMetadata(): Promise<Metadata> {
  const site = await getResolvedWeddingSettings()
  const title = metadataTitle(site)
  return {
    title: { absolute: title },
    description: weddingConfig.metadata.description,
    openGraph: {
      title,
      description: weddingConfig.metadata.description,
      locale: "pt_BR",
      type: "website",
      images: [
        {
          url: weddingConfig.metadata.ogImage,
          width: 1200,
          height: 630,
          alt: site.couple.displayName,
        },
      ],
    },
  }
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  )
}

async function HomeContent() {
  const site = await getResolvedWeddingSettings()

  return (
    <SiteProvider site={site}>
      <div className="wedding-site min-h-dvh" style={weddingSiteStyle(site)}>
        <HomeShell>
          <Hero site={site} />
          <FaithSection faith={site.faith} />
          <EventDetails site={site} />
          <RSVPCallToAction />
          <GiftList availableImages={existingGiftImages()} />
          <Suspense fallback={null}>
            <PixSectionGate />
          </Suspense>
          <MessageSection />
          <FAQ site={site} />
          <FinalSection site={site} />
          <Footer site={site} />
        </HomeShell>
      </div>
    </SiteProvider>
  )
}
