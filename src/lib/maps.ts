import { weddingConfig } from "@/config/wedding"

export function venueMapsUrl() {
  const { venue } = weddingConfig
  const query = [
    venue.name,
    venue.address,
    venue.neighborhood,
    `${venue.city} - ${venue.state}`,
  ].join(", ")

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export function venueLines() {
  const { venue } = weddingConfig
  return [
    venue.name,
    venue.address,
    `Bairro ${venue.neighborhood}`,
    `${venue.city} - ${venue.state}`,
  ]
}
