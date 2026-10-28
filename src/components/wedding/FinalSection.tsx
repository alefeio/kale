import { weddingConfig } from "@/config/wedding"
import { Branch } from "@/components/wedding/Botanical"

export function FinalSection() {
  const { ceremony, copy, couple } = weddingConfig

  return (
    <section className="relative overflow-hidden px-5 py-28 text-center sm:py-36">
      <Branch className="pointer-events-none absolute top-8 left-0 w-24 text-olive/20 sm:w-36" />
      <div className="relative mx-auto max-w-xl">
        <p className="text-[0.72rem] tracking-[0.38em] text-brown uppercase">{ceremony.dottedDate}</p>
        <h2 className="mt-6 font-serif text-3xl leading-snug font-medium text-olive-dark whitespace-pre-line sm:text-5xl">
          {copy.finalBlessing}
        </h2>
        <p className="mt-10 font-script text-5xl text-olive sm:text-6xl">{couple.displayName}</p>
      </div>
    </section>
  )
}
