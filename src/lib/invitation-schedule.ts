import type { ResolvedEventLocation } from "@/lib/site-settings"

const OPTIONAL_HINT = /opcional/i
const INDIVIDUAL_HINT = /consuma[cç][aã]o\s+individual|consuma[cç][aã]o\s+por\s+conta|individual/i

/** Notes shown under a location on the private invitation schedule. */
export function invitationLocationNotes(
  location: ResolvedEventLocation,
  dinnerOptionalNote: string,
): string[] {
  const notes: string[] = []
  const description = location.description?.trim()
  if (description) notes.push(description)

  if (location.type !== "DINNER") return notes

  const combined = notes.join("\n")
  const alreadyCovered = OPTIONAL_HINT.test(combined) && INDIVIDUAL_HINT.test(combined)
  if (!alreadyCovered) notes.push(dinnerOptionalNote)
  return notes
}

export function invitationScheduleLocations(locations: ResolvedEventLocation[]) {
  return locations.filter((location) => location.active)
}
