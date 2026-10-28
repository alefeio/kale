import { weddingConfig } from "@/config/wedding"
import { BotanicalFrame } from "@/components/wedding/Botanical"
import type { ResolvedWeddingSettings } from "@/lib/site-settings"

export function FaithSection({ faith }: { faith: ResolvedWeddingSettings["faith"] }) {
  const { copy } = weddingConfig

  return (
    <section id="abertura" className="section-anchor relative overflow-hidden px-5 py-20 sm:py-32 md:py-44">
      <BotanicalFrame />
      <div className="relative mx-auto max-w-xl text-center">
        <p aria-hidden className="text-gold">
          {copy.faithEyebrow}
        </p>
        <h2 className="mt-6 font-serif text-4xl leading-tight font-medium break-words text-olive-dark sm:text-6xl">
          {faith.title}
        </h2>
        <p className="mt-8 text-base leading-8 whitespace-pre-line text-brown sm:text-lg">{faith.text}</p>
        <blockquote className="mt-16">
          <p className="font-serif text-2xl leading-relaxed font-medium whitespace-pre-line text-olive-dark italic sm:text-3xl">
            “{faith.verseText}”
          </p>
          <footer className="mt-6 text-[0.68rem] tracking-[0.28em] break-words text-brown uppercase">
            {faith.verseReference}
          </footer>
        </blockquote>
      </div>
    </section>
  )
}
