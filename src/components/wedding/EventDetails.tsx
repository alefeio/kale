"use client"

import { weddingConfig } from "@/config/wedding"
import { dinnerMentionFromLocations, downloadExactLocationIcs, downloadWeddingIcs } from "@/lib/calendar"
import { locationLines, locationMapsUrl } from "@/lib/maps"
import type { ResolvedEventLocation, ResolvedWeddingSettings } from "@/lib/site-settings"

function LocationBlock({
  location,
  site,
  showDate,
}: {
  location: ResolvedEventLocation
  site: ResolvedWeddingSettings
  showDate: boolean
}) {
  const { copy } = weddingConfig
  const lines = locationLines({
    name: location.venueName,
    address: location.venueAddress,
    neighborhood: location.venueNeighborhood,
    city: location.venueCity,
    state: location.venueState,
  })
  const mapsHref = locationMapsUrl({
    name: location.venueName,
    address: location.venueAddress,
    neighborhood: location.venueNeighborhood,
    city: location.venueCity,
    state: location.venueState,
    mapsUrl: location.mapsUrl,
  })

  return (
    <article className="border-l border-gold/70 pl-6">
      <p className="text-[0.68rem] tracking-[0.22em] text-brown uppercase">{location.typeLabel}</p>
      <h3 className="mt-2 font-serif text-2xl break-words text-olive-dark sm:text-3xl">{location.title}</h3>
      {location.kind === "primary" || showDate ? (
        <p className="mt-4 font-serif text-2xl break-words text-olive-dark sm:text-3xl">
          {location.kind === "primary" ? location.dateLabel : location.scheduleLabel}
        </p>
      ) : (
        <p className="mt-4 font-serif text-xl text-olive">{location.scheduleLabel}</p>
      )}
      {location.kind === "primary" ? (
        <p className="mt-2 font-serif text-2xl text-olive">{location.timeLabel}</p>
      ) : null}
      {location.description ? (
        <p className="mt-4 text-base leading-7 whitespace-pre-line text-brown">{location.description}</p>
      ) : null}
      <address className="mt-5 text-base leading-7 text-brown not-italic">
        {lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </address>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a className="btn btn-primary" href={mapsHref} target="_blank" rel="noopener noreferrer">
          {copy.viewMap}
        </a>
        {location.kind === "primary" ? (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              downloadWeddingIcs({
                displayName: site.couple.displayName,
                date: site.event.date,
                time: site.event.time,
                type: site.event.type,
                calendarDuration: site.event.calendarDuration,
                venue: site.venue,
                extraDescription: dinnerMentionFromLocations(site.eventLocations),
              })
            }
          >
            {copy.addToCalendar}
          </button>
        ) : null}
        {location.kind === "additional" && location.calendarEligible ? (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => downloadExactLocationIcs(site.couple.displayName, location)}
          >
            {copy.addToCalendar}
          </button>
        ) : null}
      </div>
    </article>
  )
}

export function EventDetails({ site }: { site: ResolvedWeddingSettings }) {
  const { copy } = weddingConfig
  const locations = site.eventLocations
  const multiple = locations.length > 1

  return (
    <section id="nosso-dia" className="section-anchor px-5 py-20 sm:py-28">
      <div className={`mx-auto max-w-5xl ${multiple ? "grid gap-12" : "grid gap-12 md:grid-cols-2 md:items-end md:gap-20"}`}>
        <div>
          {!multiple ? (
            <p className="text-[0.68rem] tracking-[0.28em] text-brown uppercase">{site.event.type}</p>
          ) : null}
          <h2 className="mt-4 font-serif text-4xl leading-tight font-medium text-olive-dark sm:text-6xl">
            {copy.eventTitle}
          </h2>
          {multiple ? (
            <p className="mt-5 max-w-xl text-base leading-7 text-brown">
              A cerimônia e as demais celebrações do nosso grande dia.
            </p>
          ) : null}
        </div>

        <div id="local" className={`section-anchor ${multiple ? "grid gap-10" : ""}`}>
          {locations.map((location) => (
            <div key={location.id}>
              {multiple && location.kind === "additional" && location.startMode === "AFTER_MAIN" ? (
                <p className="mb-6 text-[0.68rem] tracking-[0.22em] text-brown uppercase">Após a cerimônia</p>
              ) : null}
              <LocationBlock location={location} site={site} showDate={multiple && location.kind === "primary"} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
