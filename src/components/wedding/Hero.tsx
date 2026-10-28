import Image from "next/image"
import { weddingConfig } from "@/config/wedding"
import { Countdown } from "@/components/wedding/Countdown"

export function Hero() {
  const { heroImage, couple, ceremony, copy } = weddingConfig

  return (
    <section
      id="topo"
      aria-label="Abertura"
      className="hero-screen"
      style={{
        ["--hero-pos-mobile" as string]: heroImage.positionMobile,
        ["--hero-pos-tablet" as string]: heroImage.positionTablet,
        ["--hero-pos-desktop" as string]: heroImage.positionDesktop,
      }}
    >
      <link rel="preload" as="image" href={heroImage.src} fetchPriority="high" />
      <Image
        src={heroImage.src}
        alt={heroImage.alt}
        fill
        priority
        unoptimized
        sizes="100vw"
        className="hero-photo"
      />
      <div className="hero-tone" aria-hidden="true" />
      <div className="hero-overlay" aria-hidden="true" />

      <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center">
        <div className="pointer-events-auto flex w-full max-w-5xl flex-col items-center px-5 pb-[max(3rem,env(safe-area-inset-bottom))] text-center text-ivory lg:pb-20">
          <h1 className="rise font-script text-[3.15rem] leading-[0.88] sm:text-[3.5rem] lg:text-[5.5rem] lg:whitespace-nowrap">
            {couple.displayName}
          </h1>
          <p className="rise rise-2 mt-3 text-[0.68rem] tracking-[0.34em] text-ivory/90 uppercase sm:mt-4 sm:text-sm sm:tracking-[0.42em]">
            {ceremony.dottedDate}
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
