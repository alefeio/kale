import { weddingConfig } from "@/config/wedding"
import { BotanicalFrame } from "@/components/wedding/Botanical"

export function FaithSection() {
  const { copy, verse } = weddingConfig

  return (
    <section id="abertura" className="section-anchor relative overflow-hidden px-5 py-20 sm:py-32 md:py-44">
      <BotanicalFrame />
      <div className="relative mx-auto max-w-xl text-center">
        <p aria-hidden className="text-gold">
          {copy.faithEyebrow}
        </p>
        <h2 className="mt-6 font-serif text-4xl leading-tight font-medium text-olive-dark sm:text-6xl">
          {copy.faithTitle}
        </h2>
        <p className="mt-8 text-base leading-8 whitespace-pre-line text-brown sm:text-lg">
          {copy.faithText}
        </p>
        <blockquote className="mt-16">
          <p className="font-serif text-2xl leading-relaxed font-medium text-olive-dark italic sm:text-3xl">
            “{verse.text}”
          </p>
          <footer className="mt-6 text-[0.68rem] tracking-[0.28em] text-brown uppercase">
            {verse.reference}
          </footer>
        </blockquote>
      </div>
    </section>
  )
}
