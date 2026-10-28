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
      <Image
        src={heroImage.src}
        alt={heroImage.alt}
        fill
        priority
        sizes="100vw"
        className="hero-photo"
      />

      <div className="hero-overlay" aria-hidden="true" />

      <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center">
        <div className="pointer-events-auto flex w-full max-w-4xl flex-col items-center px-5 pb-[max(0.85rem,env(safe-area-inset-bottom))] text-center text-ivory sm:pb-4">
          <h1 className="rise font-script text-[2.35rem] leading-[0.8] sm:text-[2.9rem] lg:text-[3.2rem]">
            {couple.displayName}
          </h1>
          <p className="rise rise-2 mt-1.5 text-[0.64rem] tracking-[0.32em] text-ivory/90 uppercase sm:text-[0.72rem] sm:tracking-[0.4em]">
            {ceremony.dottedDate}
          </p>
          <div className="rise rise-3 mt-2.5">
            <Countdown />
          </div>
          <a
            href="#abertura"
            className="rise rise-5 mt-2.5 inline-flex max-w-[18.5rem] flex-col items-center gap-1 text-center text-balance text-[0.58rem] tracking-[0.12em] text-ivory/85 uppercase sm:max-w-none sm:text-[0.64rem] sm:tracking-[0.18em]"
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
