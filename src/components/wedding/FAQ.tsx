import { weddingConfig } from "@/config/wedding"
import type { ResolvedWeddingSettings } from "@/lib/site-settings"

export function FAQ({ site }: { site: ResolvedWeddingSettings }) {
  const { copy, faq } = weddingConfig
  const dinner = site.eventLocations.find(
    (location) => location.kind === "additional" && location.active && location.type === "DINNER",
  )

  const items: { question: string; answer: string }[] = faq.map((item, index) => {
    if (index === 0) {
      return {
        question: item.question,
        answer: `${site.venue.name}, no bairro do ${site.venue.neighborhood}, em ${site.venue.city}.`,
      }
    }
    if (index === 1) {
      return {
        question: item.question,
        answer: `A cerimônia religiosa terá início às ${site.event.timeLabel}.`,
      }
    }
    return { question: item.question, answer: item.answer }
  })

  if (dinner) {
    const place = [dinner.venueName, dinner.venueCity && dinner.venueState ? `${dinner.venueCity}–${dinner.venueState}` : dinner.venueCity]
      .filter(Boolean)
      .join(", ")
    const when =
      dinner.startMode === "AFTER_MAIN"
        ? "após a cerimônia"
        : dinner.scheduleLabel.toLowerCase()
    items.splice(2, 0, {
      question: "Haverá jantar após a cerimônia?",
      answer: dinner.description?.trim()
        ? dinner.description.trim()
        : `Sim. Nos reuniremos para um jantar em ${place} ${when}.`,
    })
  }

  return (
    <section className="px-5 pt-8 pb-8" aria-labelledby="duvidas-titulo">
      <div className="mx-auto max-w-2xl">
        <h2 id="duvidas-titulo" className="text-center font-serif text-4xl font-medium text-olive-dark sm:text-5xl">
          {copy.faqTitle}
        </h2>
        <p className="mt-4 text-center text-brown">{copy.faqIntro}</p>
        <div className="mt-12 border-t border-olive/15">
          {items.map((item) => (
            <details key={item.question} className="group border-b border-olive/15">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left [&::-webkit-details-marker]:hidden">
                <h3 className="font-serif text-xl font-medium text-olive-dark sm:text-2xl">{item.question}</h3>
                <span aria-hidden className="text-xl text-gold transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-5 leading-7 text-brown">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
