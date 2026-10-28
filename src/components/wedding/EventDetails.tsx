import { weddingConfig } from "@/config/wedding"
import { venueLines, venueMapsUrl } from "@/lib/maps"
import { AddToCalendar } from "@/components/wedding/AddToCalendar"

export function EventDetails() {
  const { ceremony, copy } = weddingConfig
  const lines = venueLines()

  return (
    <section id="nosso-dia" className="section-anchor px-5 py-20 sm:py-28">
      <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2 md:items-end md:gap-20">
        <div>
          <p className="text-[0.68rem] tracking-[0.28em] text-brown uppercase">{ceremony.type}</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight font-medium text-olive-dark sm:text-6xl">
            {copy.eventTitle}
          </h2>
        </div>

        <div id="local" className="section-anchor border-l border-gold/70 pl-6">
          <p className="font-serif text-3xl text-olive-dark sm:text-4xl">{ceremony.dateLabel}</p>
          <p className="mt-2 font-serif text-2xl text-olive">{ceremony.timeLabel}</p>
          <address className="mt-6 text-base leading-7 text-brown not-italic">
            {lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a className="btn btn-primary" href={venueMapsUrl()} target="_blank" rel="noopener noreferrer">
              {copy.viewMap}
            </a>
            <AddToCalendar />
          </div>
        </div>
      </div>
    </section>
  )
}
