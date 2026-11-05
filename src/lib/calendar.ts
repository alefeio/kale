import { locationLines } from "@/lib/maps"
import type { ResolvedEventLocation } from "@/lib/site-settings"

export type CalendarDetails = {
  displayName: string
  date: string
  time: string
  type: string
  calendarDuration: string
  venue: {
    name: string
    address: string
    neighborhood: string
    city: string
    state: string
  }
  extraDescription?: string
}

function icsEscape(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

function formatStamp(date: Date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
}

export function dinnerMentionFromLocations(locations: ResolvedEventLocation[]) {
  const dinners = locations.filter(
    (location) =>
      location.kind === "additional" &&
      location.active &&
      (location.type === "DINNER" || location.startMode === "AFTER_MAIN"),
  )
  if (dinners.length === 0) return ""
  return dinners
    .map((location) => {
      const when =
        location.startMode === "AFTER_MAIN"
          ? "após a cerimônia"
          : location.scheduleLabel.toLowerCase()
      return `${location.title}: ${location.venueName} (${when}).`
    })
    .join(" ")
}

export function buildWeddingIcs(details: CalendarDetails, now = new Date()) {
  const dtStart = `${details.date.replaceAll("-", "")}T${details.time.replace(":", "")}00`
  const location = icsEscape(
    [details.venue.name, details.venue.address, details.venue.neighborhood, `${details.venue.city} - ${details.venue.state}`].join(", "),
  )
  const baseDescription = `${details.type}. ${locationLines(details.venue).join(" ")}`
  const description = icsEscape(
    details.extraDescription?.trim()
      ? `${baseDescription} ${details.extraDescription.trim()}`
      : baseDescription,
  )

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Karen e Alexandre//Casamento//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE",
    "TZID:America/Belem",
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:-0300",
    "TZOFFSETTO:-0300",
    "TZNAME:-03",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    "UID:casamento-karen-alexandre-2026@convite",
    `DTSTAMP:${formatStamp(now)}`,
    `DTSTART;TZID=America/Belem:${dtStart}`,
    `DURATION:${details.calendarDuration}`,
    `SUMMARY:${icsEscape(`${details.displayName} — Cerimônia de casamento`)}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")
}

export function buildExactLocationIcs(
  details: {
    displayName: string
    location: ResolvedEventLocation
    calendarDuration?: string
  },
  now = new Date(),
) {
  if (!details.location.calendarEligible || !details.location.date || !details.location.time) {
    throw new Error("Local sem horário exato não gera evento de calendário.")
  }
  const dtStart = `${details.location.date.replaceAll("-", "")}T${details.location.time.replace(":", "")}00`
  const location = icsEscape(
    [
      details.location.venueName,
      details.location.venueAddress,
      details.location.venueNeighborhood,
      `${details.location.venueCity} - ${details.location.venueState}`,
    ]
      .filter(Boolean)
      .join(", "),
  )
  const description = icsEscape(
    `${details.location.title}. ${locationLines({
      name: details.location.venueName,
      address: details.location.venueAddress,
      neighborhood: details.location.venueNeighborhood,
      city: details.location.venueCity,
      state: details.location.venueState,
    }).join(" ")}`,
  )

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Karen e Alexandre//Casamento//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE",
    "TZID:America/Belem",
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:-0300",
    "TZOFFSETTO:-0300",
    "TZNAME:-03",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:casamento-local-${details.location.id}@convite`,
    `DTSTAMP:${formatStamp(now)}`,
    `DTSTART;TZID=America/Belem:${dtStart}`,
    `DURATION:${details.calendarDuration ?? "PT2H"}`,
    `SUMMARY:${icsEscape(`${details.displayName} — ${details.location.title}`)}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")
}

export function downloadWeddingIcs(details: CalendarDetails) {
  const ics = buildWeddingIcs(details)
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "casamento-karen-alexandre.ics"
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function downloadExactLocationIcs(displayName: string, location: ResolvedEventLocation) {
  const ics = buildExactLocationIcs({ displayName, location })
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `casamento-${location.id}.ics`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
