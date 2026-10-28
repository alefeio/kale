import { weddingConfig } from "@/config/wedding"
import { Branch } from "@/components/wedding/Botanical"
import { publicImageExists } from "@/lib/media"
import type { ResolvedWeddingSettings } from "@/lib/site-settings"
import Image from "next/image"

const finalPhoto = "/images/casal-final.jpg"

export function FinalSection({ site }: { site: ResolvedWeddingSettings }) {
  const { copy } = weddingConfig
  const hasPhoto = publicImageExists(finalPhoto)

  const words = (
    <div className={hasPhoto ? "text-center md:text-left" : "relative mx-auto max-w-xl text-center"}>
      <p className="text-[0.72rem] tracking-[0.38em] text-brown uppercase">{site.event.dottedDate}</p>
      <h2 className="mt-6 font-serif text-3xl leading-snug font-medium text-olive-dark whitespace-pre-line sm:text-5xl">
        {copy.finalBlessing}
      </h2>
      <p className="mt-10 font-script text-5xl break-words text-olive sm:text-6xl">{site.couple.displayName}</p>
    </div>
  )

  if (!hasPhoto) {
    return (
      <section className="relative overflow-hidden px-5 py-24 text-center sm:py-36">
        <Branch className="pointer-events-none absolute top-8 left-0 w-24 text-olive/20 sm:w-36" />
        {words}
      </section>
    )
  }

  return (
    <section className="px-5 py-20 sm:py-28">
      <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2 md:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--hero-base)]">
          <Image
            src={finalPhoto}
            alt={site.couple.displayName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center opacity-90"
            style={{ filter: "saturate(0.9) contrast(0.97) brightness(0.98)" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[rgba(78,84,64,0.1)]" aria-hidden="true" />
        </div>
        {words}
      </div>
    </section>
  )
}
