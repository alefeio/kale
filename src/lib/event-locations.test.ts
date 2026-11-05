import assert from "node:assert/strict"
import { test } from "node:test"
import { buildExactLocationIcs, buildWeddingIcs, dinnerMentionFromLocations } from "./calendar"
import { locationMapsUrl } from "./maps"
import {
  resolveWeddingSettings,
  validateAdditionalEventLocation,
  type EventLocationRow,
} from "./site-settings"

function row(partial: Partial<EventLocationRow> & Pick<EventLocationRow, "id" | "title" | "venueName">): EventLocationRow {
  return {
    type: "DINNER",
    venueAddress: null,
    venueNeighborhood: null,
    venueCity: "Belém",
    venueState: "PA",
    description: null,
    startMode: "AFTER_MAIN",
    startsAt: null,
    mapsUrl: null,
    sortOrder: 0,
    active: true,
    ...partial,
  }
}

test("single location keeps only the primary ceremony", () => {
  const site = resolveWeddingSettings(null, [])
  assert.equal(site.eventLocations.length, 1)
  assert.equal(site.eventLocations[0].title, "Cerimônia religiosa")
  assert.equal(site.eventLocations[0].calendarEligible, true)
})

test("two and three locations stay ordered and skip inactive", () => {
  const locations = [
    row({ id: "a", title: "Jantar", venueName: "Varanda Boi Novo", sortOrder: 2, active: true }),
    row({
      id: "b",
      title: "Recepção",
      venueName: "Casa",
      type: "RECEPTION",
      sortOrder: 1,
      active: false,
    }),
    row({
      id: "c",
      title: "Brunch",
      venueName: "Café",
      type: "OTHER",
      sortOrder: 0,
      active: true,
      startMode: "UNSPECIFIED",
    }),
  ]
  const site = resolveWeddingSettings(null, locations)
  assert.equal(site.eventLocations.length, 3)
  assert.equal(site.eventLocations[0].kind, "primary")
  assert.equal(site.eventLocations[1].title, "Brunch")
  assert.equal(site.eventLocations[2].title, "Jantar")
  assert.equal(site.eventLocations.some((item) => item.title === "Recepção"), false)
})

test("time modes resolve without inventing dinner hours", () => {
  const after = resolveWeddingSettings(null, [
    row({ id: "dinner", title: "Jantar — Varanda Boi Novo", venueName: "Varanda Boi Novo" }),
  ]).eventLocations[1]
  assert.equal(after.startMode, "AFTER_MAIN")
  assert.equal(after.scheduleLabel, "Após a cerimônia")
  assert.equal(after.calendarEligible, false)
  assert.equal(after.time, null)

  const unspecified = resolveWeddingSettings(null, [
    row({ id: "x", title: "Outro", venueName: "Local X", startMode: "UNSPECIFIED" }),
  ]).eventLocations[1]
  assert.equal(unspecified.scheduleLabel, "Horário a definir")
  assert.equal(unspecified.calendarEligible, false)
})

test("exact additional location keeps its own schedule", () => {
  const startsAt = new Date(Date.UTC(2026, 10, 12, 22, 30, 0))
  const location = resolveWeddingSettings(null, [
    row({
      id: "exact",
      title: "Recepção",
      venueName: "Salão",
      type: "RECEPTION",
      startMode: "EXACT",
      startsAt,
    }),
  ]).eventLocations[1]
  assert.equal(location.calendarEligible, true)
  assert.equal(location.timeLabel, "19h30")
})

test("optional address and independent maps links", () => {
  const dinner = resolveWeddingSettings(null, [
    row({
      id: "dinner",
      title: "Jantar",
      venueName: "Varanda Boi Novo",
      venueAddress: null,
      venueCity: "Belém",
      venueState: "PA",
    }),
  ]).eventLocations[1]
  const url = locationMapsUrl({
    name: dinner.venueName,
    address: dinner.venueAddress,
    neighborhood: dinner.venueNeighborhood,
    city: dinner.venueCity,
    state: dinner.venueState,
    mapsUrl: dinner.mapsUrl,
  })
  assert.equal(url.includes("Varanda%20Boi%20Novo"), true)
  assert.equal(url.includes("Bel%C3%A9m"), true)
  assert.equal(url.includes("Piraj"), false)

  const custom = locationMapsUrl({
    name: "Varanda Boi Novo",
    city: "Belém",
    state: "PA",
    mapsUrl: "https://www.google.com/maps/place/varanda",
  })
  assert.equal(custom, "https://www.google.com/maps/place/varanda")
  assert.equal(
    locationMapsUrl({
      name: "X",
      city: "Belém",
      state: "PA",
      mapsUrl: "javascript:alert(1)",
    }).startsWith("https://www.google.com/maps/search/"),
    true,
  )
})

test("additional location validation", () => {
  assert.equal(
    validateAdditionalEventLocation({
      type: "DINNER",
      title: "",
      venueName: "Varanda",
      venueAddress: "",
      venueNeighborhood: "",
      venueCity: "Belém",
      venueState: "PA",
      description: "",
      startMode: "AFTER_MAIN",
      date: "",
      time: "",
      mapsUrl: "",
      active: true,
    }).ok,
    false,
  )
  assert.equal(
    validateAdditionalEventLocation({
      type: "DINNER",
      title: "Jantar",
      venueName: "Varanda Boi Novo",
      venueAddress: "",
      venueNeighborhood: "",
      venueCity: "Belém",
      venueState: "PA",
      description: "Após a cerimônia, haverá um jantar na Varanda Boi Novo.",
      startMode: "AFTER_MAIN",
      date: "",
      time: "",
      mapsUrl: "",
      active: true,
    }).ok,
    true,
  )
  assert.equal(
    validateAdditionalEventLocation({
      type: "DINNER",
      title: "Jantar",
      venueName: "Varanda",
      venueAddress: "",
      venueNeighborhood: "",
      venueCity: "Belém",
      venueState: "PA",
      description: "",
      startMode: "EXACT",
      date: "",
      time: "",
      mapsUrl: "",
      active: true,
    }).ok,
    false,
  )
  assert.equal(
    validateAdditionalEventLocation({
      type: "OTHER",
      title: "Festa",
      venueName: "Local",
      venueAddress: "",
      venueNeighborhood: "",
      venueCity: "Belém",
      venueState: "PA",
      description: "",
      startMode: "UNSPECIFIED",
      date: "",
      time: "",
      mapsUrl: "ftp://evil",
      active: true,
    }).ok,
    false,
  )
})

test("calendar keeps ceremony and refuses fictional dinner times", () => {
  const site = resolveWeddingSettings(null, [
    row({
      id: "dinner",
      title: "Jantar — Varanda Boi Novo",
      venueName: "Varanda Boi Novo",
      description: "Após a cerimônia, haverá um jantar na Varanda Boi Novo.",
    }),
  ])
  const ics = buildWeddingIcs({
    displayName: site.couple.displayName,
    date: site.event.date,
    time: site.event.time,
    type: site.event.type,
    calendarDuration: site.event.calendarDuration,
    venue: site.venue,
    extraDescription: dinnerMentionFromLocations(site.eventLocations),
  })
  assert.equal(ics.includes("DTSTART;TZID=America/Belem:20261112T193000"), true)
  assert.equal(ics.includes("Varanda Boi Novo"), true)
  assert.equal(ics.includes("após a cerimônia"), true)
  assert.equal(ics.includes("T210000"), false)
  assert.equal(ics.includes("T220000"), false)

  const dinner = site.eventLocations[1]
  assert.throws(() => buildExactLocationIcs({ displayName: site.couple.displayName, location: dinner }))

  const exact = resolveWeddingSettings(null, [
    row({
      id: "exact",
      title: "Recepção",
      venueName: "Salão",
      type: "RECEPTION",
      startMode: "EXACT",
      startsAt: new Date(Date.UTC(2026, 10, 12, 23, 0, 0)),
    }),
  ]).eventLocations[1]
  const exactIcs = buildExactLocationIcs({ displayName: "Karen & Alexandre", location: exact })
  assert.equal(exactIcs.includes("DTSTART;TZID=America/Belem:20261112T200000"), true)
  assert.equal(exactIcs.includes("casamento-local-exact@convite"), true)
})

test("primary ceremony mutations are refused; additional ids pass the guard", async () => {
  const {
    assertServiceAdditionalLocationId,
    guardAdditionalLocationId,
    guardReorderAdditionalLocationIds,
  } = await import("./event-location-guards")
  const { readFileSync } = await import("node:fs")
  const { fileURLToPath } = await import("node:url")
  const { dirname, join } = await import("node:path")

  assert.equal(guardAdditionalLocationId("primary", "delete").ok, false)
  assert.equal(guardAdditionalLocationId("primary", "deactivate").ok, false)
  assert.equal(guardAdditionalLocationId("primary", "update").ok, false)
  assert.equal(guardAdditionalLocationId("", "delete").ok, false)
  assert.equal(guardAdditionalLocationId("loc_dinner", "delete").ok, true)
  assert.equal(guardAdditionalLocationId("loc_dinner", "deactivate").ok, true)
  assert.equal(guardAdditionalLocationId("loc_dinner", "update").ok, true)

  assert.throws(() => assertServiceAdditionalLocationId("primary"), /PRIMARY_LOCKED/)
  assert.throws(() => assertServiceAdditionalLocationId(""), /PRIMARY_LOCKED/)
  assert.doesNotThrow(() => assertServiceAdditionalLocationId("loc_dinner"))

  assert.equal(guardReorderAdditionalLocationIds(["a", "primary"]).ok, false)
  assert.equal(guardReorderAdditionalLocationIds(["a", "a"]).ok, false)
  assert.equal(guardReorderAdditionalLocationIds(["a", "b"]).ok, true)

  const actionsPath = join(dirname(fileURLToPath(import.meta.url)), "../actions/settings.ts")
  const actionsSource = readFileSync(actionsPath, "utf8")
  for (const name of [
    "createAdditionalEventLocation",
    "updateAdditionalEventLocation",
    "toggleAdditionalEventLocation",
    "reorderAdditionalEventLocations",
    "removeAdditionalEventLocation",
  ]) {
    const block = actionsSource.split(`export async function ${name}`)[1]?.slice(0, 400) ?? ""
    assert.match(block, /await requireAdmin\(\)/, `${name} must call requireAdmin`)
  }
})

test("AFTER_MAIN eyebrow is driven by startMode, not list index", () => {
  const site = resolveWeddingSettings(null, [
    row({
      id: "exact-first",
      title: "Ensaio",
      venueName: "Salão",
      type: "OTHER",
      startMode: "EXACT",
      startsAt: new Date(Date.UTC(2026, 10, 12, 21, 0, 0)),
      sortOrder: 0,
    }),
    row({
      id: "dinner",
      title: "Jantar",
      venueName: "Varanda Boi Novo",
      startMode: "AFTER_MAIN",
      sortOrder: 1,
    }),
    row({
      id: "later",
      title: "Brunch",
      venueName: "Café",
      type: "OTHER",
      startMode: "UNSPECIFIED",
      sortOrder: 2,
    }),
  ])
  const [, exact, dinner, brunch] = site.eventLocations
  assert.equal(exact.startMode, "EXACT")
  assert.notEqual(exact.scheduleLabel, "Após a cerimônia")
  assert.equal(dinner.startMode, "AFTER_MAIN")
  assert.equal(dinner.scheduleLabel, "Após a cerimônia")
  assert.equal(brunch.startMode, "UNSPECIFIED")
  assert.equal(brunch.scheduleLabel, "Horário a definir")
})
