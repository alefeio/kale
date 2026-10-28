import { weddingConfig } from "@/config/wedding"

type Venue = {
  name: string
  address: string
  neighborhood: string
  city: string
  state: string
}

export function venueMapsUrl(venue: Venue = weddingConfig.venue) {
  const query = [venue.name, venue.address, venue.neighborhood, `${venue.city} - ${venue.state}`].join(", ")
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export function venueLines(venue: Venue = weddingConfig.venue) {
  return [venue.name, venue.address, `Bairro ${venue.neighborhood}`, `${venue.city} - ${venue.state}`]
}
