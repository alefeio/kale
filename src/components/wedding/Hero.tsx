import { Countdown } from "@/components/wedding/Countdown"
import { weddingConfig } from "@/config/wedding"
import type { ResolvedWeddingSettings } from "@/lib/site-settings"

export function Hero({ site }: { site: ResolvedWeddingSettings }) {
  const { copy } = weddingConfig

  return (
    <section id="topo" aria-label="Abertura" className="hero-screen">
      <link rel="preload" as="image" href={site.hero.src} fetchPriority="high" />
      {/* The photo host comes from APIMG and is not known at build time. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={site.hero.src} alt={site.hero.alt} className="hero-photo" fetchPriority="high" />
      <div className="hero-tone" aria-hidden="true" />
      <div className="hero-warm" aria-hidden="true" />
      <div className="hero-overlay" aria-hidden="true" />

      <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center">
        <div className="pointer-events-auto flex w-full max-w-5xl flex-col items-center px-5 pb-[max(3rem,env(safe-area-inset-bottom))] text-center text-ivory lg:pb-20">
          <h1 className="rise font-script text-[3.15rem] leading-[0.88] break-words sm:text-[3.5rem] lg:text-[5.5rem]">
            {site.couple.displayName}
          </h1>
          <p className="rise rise-2 mt-3 text-[0.68rem] tracking-[0.34em] text-ivory/90 uppercase sm:mt-4 sm:text-sm sm:tracking-[0.42em]">
            {site.event.dottedDate}
          </p>
          <div className="rise rise-3 mt-5 sm:mt-6">
            <Countdown />
          </div>
          <a
            href="#abertura"
            className="rise rise-5 mt-6 inline-flex max-w-[18.5rem] flex-col items-center gap-1.5 text-center text-balance text-[0.62rem] tracking-[0.14em] text-ivory/85 uppercase sm:mt-8 sm:max-w-none sm:text-[0.68rem] sm:tracking-[0.18em]"
          >
            {copy.scrollHint}
            <span aria-hidden className="hint-arrow text-base">
              ↓
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
