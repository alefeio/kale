import { Suspense } from "react"
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
import { existingGiftImages } from "@/lib/media"

export default function Page() {
  return (
    <HomeShell>
      <Hero />
      <FaithSection />
      <EventDetails />
      <RSVPCallToAction />
      <GiftList availableImages={existingGiftImages()} />
      <Suspense fallback={null}>
        <PixSectionGate />
      </Suspense>
      <MessageSection />
      <FAQ />
      <FinalSection />
      <Footer />
    </HomeShell>
  )
}
