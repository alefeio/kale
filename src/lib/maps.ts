import { weddingConfig } from "@/config/wedding"
import { isSafeExternalHttpUrl } from "@/lib/site-settings"

export type VenueLike = {
  name: string
  address?: string | null
  neighborhood?: string | null
  city: string
  state: string
  mapsUrl?: string | null
}

type LegacyVenue = {
  name: string
  address: string
  neighborhood: string
  city: string
  state: string
}

export function locationMapsUrl(location: VenueLike) {
  const explicit = location.mapsUrl?.trim()
  if (explicit && isSafeExternalHttpUrl(explicit)) return explicit

  const query = [
    location.name,
    location.address?.trim() || null,
    location.neighborhood?.trim() || null,
    `${location.city} - ${location.state}`,
  ]
    .filter(Boolean)
    .join(", ")

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export function locationLines(location: VenueLike) {
  const lines = [location.name]
  if (location.address?.trim()) lines.push(location.address.trim())
  if (location.neighborhood?.trim()) lines.push(`Bairro ${location.neighborhood.trim()}`)
  lines.push(`${location.city} - ${location.state}`)
  return lines
}

export function venueMapsUrl(venue: LegacyVenue = weddingConfig.venue) {
  return locationMapsUrl(venue)
}

export function venueLines(venue: LegacyVenue = weddingConfig.venue) {
  return locationLines(venue)
}
