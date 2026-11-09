import assert from "node:assert/strict"
import { test } from "node:test"
import { weddingConfig } from "../config/wedding"
import { invitationLocationNotes, invitationScheduleLocations } from "./invitation-schedule"
import { locationMapsUrl } from "./maps"
import { resolveWeddingSettings, type EventLocationRow } from "./site-settings"

function row(
  partial: Partial<EventLocationRow> & Pick<EventLocationRow, "id" | "title" | "venueName">,
): EventLocationRow {
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

test("invitation schedule keeps primary and active additional locations only", () => {
  const site = resolveWeddingSettings(null, [
    row({ id: "inactive", title: "Inativo", venueName: "X", active: false, sortOrder: 0 }),
    row({
      id: "dinner",
      title: "Jantar",
      venueName: "Varanda Boi Novo",
      venueAddress: "Av. Generalíssimo Deodoro, 1731",
      description: "Participação opcional, com consumação individual.",
      sortOrder: 1,
    }),
  ])
  const locations = invitationScheduleLocations(site.eventLocations)
  assert.equal(locations.length, 2)
  assert.equal(locations[0].kind, "primary")
  assert.equal(locations[1].title, "Jantar")
  assert.equal(locations[1].startMode, "AFTER_MAIN")
  assert.equal(locations[1].scheduleLabel, "Após a cerimônia")
  assert.equal(locations.some((item) => item.title === "Inativo"), false)
})

test("dinner optional note uses admin description when already complete", () => {
  const dinner = resolveWeddingSettings(null, [
    row({
      id: "dinner",
      title: "Jantar",
      venueName: "Varanda Boi Novo",
      description: "O jantar é opcional, com consumação individual.",
    }),
  ]).eventLocations[1]
  const notes = invitationLocationNotes(dinner, weddingConfig.copy.invitationDinnerOptionalNote)
  assert.deepEqual(notes, ["O jantar é opcional, com consumação individual."])
})

test("dinner optional note falls back to kale config when missing", () => {
  const dinner = resolveWeddingSettings(null, [
    row({
      id: "dinner",
      title: "Jantar",
      venueName: "Varanda Boi Novo",
      description: "Após a cerimônia nos reuniremos para um jantar.",
    }),
  ]).eventLocations[1]
  const notes = invitationLocationNotes(dinner, weddingConfig.copy.invitationDinnerOptionalNote)
  assert.equal(notes.includes("Após a cerimônia nos reuniremos para um jantar."), true)
  assert.equal(notes.includes(weddingConfig.copy.invitationDinnerOptionalNote), true)
})

test("exact and unspecified schedules stay honest", () => {
  const startsAt = new Date(Date.UTC(2026, 10, 12, 22, 30, 0))
  const site = resolveWeddingSettings(null, [
    row({
      id: "exact",
      title: "Recepção",
      venueName: "Salão",
      type: "RECEPTION",
      startMode: "EXACT",
      startsAt,
      sortOrder: 0,
    }),
    row({
      id: "later",
      title: "Brunch",
      venueName: "Café",
      type: "OTHER",
      startMode: "UNSPECIFIED",
      sortOrder: 1,
    }),
  ])
  const [, exact, brunch] = invitationScheduleLocations(site.eventLocations)
  assert.equal(exact.calendarEligible, true)
  assert.equal(exact.timeLabel, "19h30")
  assert.equal(brunch.scheduleLabel, "Horário a definir")
  assert.equal(brunch.calendarEligible, false)
})

test("maps links stay independent and never include invitation tokens", () => {
  const dinner = resolveWeddingSettings(null, [
    row({
      id: "dinner",
      title: "Jantar",
      venueName: "Varanda Boi Novo",
      venueAddress: "Av. Generalíssimo Deodoro, 1731",
      venueCity: "Belém",
      venueState: "PA",
    }),
  ]).eventLocations[1]
  const dinnerUrl = locationMapsUrl({
    name: dinner.venueName,
    address: dinner.venueAddress,
    neighborhood: dinner.venueNeighborhood,
    city: dinner.venueCity,
    state: dinner.venueState,
    mapsUrl: dinner.mapsUrl,
  })
  const ceremonyUrl = locationMapsUrl({
    name: "Salão de festas do Ed. Torres Devant",
    address: "Travessa Pirajá, nº 520",
    neighborhood: "Pedreira",
    city: "Belém",
    state: "PA",
  })
  assert.equal(dinnerUrl.includes("Varanda"), true)
  assert.equal(dinnerUrl.includes("Deodoro"), true)
  assert.equal(dinnerUrl.includes("Piraj"), false)
  assert.equal(ceremonyUrl.includes("Torres"), true)
  assert.equal(dinnerUrl.includes("token"), false)
  assert.equal(dinnerUrl.includes("convite"), false)
  assert.equal(
    locationMapsUrl({
      name: "Varanda Boi Novo",
      city: "Belém",
      state: "PA",
      mapsUrl: "javascript:alert(1)",
    }).startsWith("https://www.google.com/maps/search/"),
    true,
  )
})
