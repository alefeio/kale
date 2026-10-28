import { venueLines } from "@/lib/maps"

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

export function buildWeddingIcs(details: CalendarDetails, now = new Date()) {
  const dtStart = `${details.date.replaceAll("-", "")}T${details.time.replace(":", "")}00`
  const location = icsEscape(
    [details.venue.name, details.venue.address, details.venue.neighborhood, `${details.venue.city} - ${details.venue.state}`].join(", "),
  )
  const description = icsEscape(`${details.type}. ${venueLines(details.venue).join(" ")}`)

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
