import { weddingConfig } from "@/config/wedding"
import { venueLines } from "@/lib/maps"

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

export function buildWeddingIcs(now = new Date()) {
  const { ceremony, couple, venue } = weddingConfig
  const dtStart = ceremony.date.replaceAll("-", "") + "T190000"
  const location = icsEscape(
    [venue.name, venue.address, venue.neighborhood, `${venue.city} - ${venue.state}`].join(", "),
  )
  const description = icsEscape(
    `${ceremony.type}. ${venueLines().join(" ")}`,
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
    `DURATION:${ceremony.calendarDuration}`,
    `SUMMARY:${icsEscape(`${couple.displayName} — Cerimônia de casamento`)}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")
}

export function downloadWeddingIcs() {
  const ics = buildWeddingIcs()
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
