"use client"

import { downloadWeddingIcs } from "@/lib/calendar"
import { weddingConfig } from "@/config/wedding"
import { useOptionalSite } from "@/components/wedding/site-context"

export function AddToCalendar() {
  const site = useOptionalSite()
  const details = site
    ? {
        displayName: site.couple.displayName,
        date: site.event.date,
        time: site.event.time,
        type: site.event.type,
        calendarDuration: site.event.calendarDuration,
        venue: site.venue,
      }
    : {
        displayName: weddingConfig.couple.displayName,
        date: weddingConfig.ceremony.date,
        time: weddingConfig.ceremony.time,
        type: weddingConfig.ceremony.type,
        calendarDuration: weddingConfig.ceremony.calendarDuration,
        venue: weddingConfig.venue,
      }

  return (
    <button type="button" className="btn btn-secondary" onClick={() => downloadWeddingIcs(details)}>
      {weddingConfig.copy.addToCalendar}
    </button>
  )
}
