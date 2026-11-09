"use client"

import { useOptionalSite } from "@/components/wedding/site-context"
import { weddingConfig } from "@/config/wedding"
import { invitationLocationNotes, invitationScheduleLocations } from "@/lib/invitation-schedule"
import { locationLines, locationMapsUrl } from "@/lib/maps"
import type { ResolvedEventLocation } from "@/lib/site-settings"

function ScheduleItem({ location }: { location: ResolvedEventLocation }) {
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
  const notes = invitationLocationNotes(location, copy.invitationDinnerOptionalNote)

  return (
    <article className="border-l border-gold/70 pl-5">
      <p className="text-[0.68rem] tracking-[0.2em] text-brown uppercase">{location.typeLabel}</p>
      <h3 className="mt-1.5 font-serif text-2xl leading-snug break-words text-olive-dark">{location.title}</h3>

      {location.kind === "primary" ? (
        <>
          {location.dateLabel ? (
            <p className="mt-3 font-serif text-xl text-olive-dark">{location.dateLabel}</p>
          ) : null}
          {location.timeLabel ? <p className="mt-1 font-serif text-xl text-olive">{location.timeLabel}</p> : null}
        </>
      ) : (
        <p className="mt-3 font-serif text-lg text-olive">{location.scheduleLabel}</p>
      )}

      {notes.map((note) => (
        <p key={note} className="mt-3 text-sm leading-6 whitespace-pre-line text-brown">
          {note}
        </p>
      ))}

      <address className="mt-3 text-sm leading-6 text-brown not-italic">
        {lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </address>

      <a
        className="btn btn-secondary mt-4"
        href={mapsHref}
        target="_blank"
        rel="noopener noreferrer"
      >
        {copy.viewMap}
      </a>
    </article>
  )
}

export function InvitationEventSchedule() {
  const site = useOptionalSite()
  const { copy } = weddingConfig
  const locations = invitationScheduleLocations(site?.eventLocations ?? [])
  if (!locations.length) return null

  const hasDinner = locations.some((location) => location.type === "DINNER")

  return (
    <section className="mt-12 border-t border-olive/15 pt-10" aria-labelledby="programacao-titulo">
      <h2 id="programacao-titulo" className="font-serif text-3xl font-medium text-olive-dark">
        {copy.invitationScheduleTitle}
      </h2>

      <div className="mt-8 grid gap-8">
        {locations.map((location) => (
          <ScheduleItem key={location.id} location={location} />
        ))}
      </div>

      <p className="mt-8 text-sm leading-6 text-brown">
        {copy.invitationCeremonyRsvpNote}
        {hasDinner ? ` ${copy.invitationDinnerRsvpNote}` : ""}
      </p>
    </section>
  )
}
