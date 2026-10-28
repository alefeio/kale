import assert from "node:assert/strict"
import { test } from "node:test"
import { createApimgFormData, inspectImage, parseApimgUploadResponse } from "./apimg"
import { invitationShareText } from "./invitation-link"
import { venueMapsUrl } from "./maps"
import {
  describeEvent,
  eventInstant,
  resolveWeddingSettings,
  settingFieldGroups,
  validateEventAndVenue,
  validateFaith,
  validateIdentityAndHero,
  validateTheme,
  defaultColors,
} from "./site-settings"

test("null settings fall back to the current wedding config", () => {
  const site = resolveWeddingSettings(null)
  assert.equal(site.couple.displayName, "Karen & Alexandre")
  assert.equal(site.couple.monogram, "K&A")
  assert.equal(site.hero.src, "/images/casal-hero.jpg")
  assert.equal(site.hero.positionX, 50)
  assert.equal(site.hero.heightMobile, 100)
  assert.equal(site.event.dateLabel, "14 de novembro de 2026")
  assert.equal(site.event.timeLabel, "19h")
  assert.equal(site.faith.title, "Pela graça de Deus")
  assert.equal(site.venue.name, "Maison Rose Eventos")
  assert.equal(site.colors.ivory, defaultColors.ivory)
})

test("a saved field overrides only that field", () => {
  const site = resolveWeddingSettings({
    brideName: "Noiva Teste",
    groomName: null,
    heroImageUrl: null,
    heroImagePublicId: null,
    heroPositionX: null,
    heroPositionY: null,
    heroHeightMobile: 60,
    heroHeightTablet: null,
    heroHeightDesktop: null,
    eventAt: null,
    eventTimezone: null,
    faithTitle: null,
    faithText: null,
    verseText: null,
    verseReference: null,
    venueName: null,
    venueAddress: null,
    venueNeighborhood: null,
    venueCity: null,
    venueState: null,
    colorIvory: null,
    colorCream: null,
    colorPrimary: null,
    colorPrimaryDark: null,
    colorAccent: null,
    colorTextMuted: null,
    colorText: null,
    colorHeroBase: "#112233",
  })
  assert.equal(site.couple.displayName, "Noiva Teste & Alexandre")
  assert.equal(site.hero.heightMobile, 60)
  assert.equal(site.hero.heightDesktop, 100)
  assert.equal(site.colors.heroBase, "#112233")
  assert.equal(site.venue.city, "Belém")
})

test("event labels come from one Belem instant", () => {
  const event = describeEvent(eventInstant("2026-11-14", "19:00"))
  assert.equal(event.dateLabel, "14 de novembro de 2026")
  assert.equal(event.timeLabel, "19h")
  assert.equal(event.dottedDate, "14 • 11 • 2026")
  assert.equal(event.numericDate, "14.11.2026")
  assert.equal(event.isoDate, "2026-11-14T19:00:00-03:00")
  assert.equal(event.timezone, "America/Belem")
})

test("identity, theme, faith and venue validation", () => {
  assert.equal(validateIdentityAndHero({
    brideName: " ",
    groomName: "Alexandre",
    heroPositionX: 50,
    heroPositionY: 50,
    heroHeightMobile: 100,
    heroHeightTablet: 100,
    heroHeightDesktop: 100,
  }).ok, false)
  assert.equal(validateIdentityAndHero({
    brideName: "Karen",
    groomName: "Alexandre",
    heroPositionX: 120,
    heroPositionY: 50,
    heroHeightMobile: 100,
    heroHeightTablet: 100,
    heroHeightDesktop: 100,
  }).ok, false)
  assert.equal(validateTheme({ ...defaultColors, ivory: "red" }).ok, false)
  assert.equal(validateTheme(defaultColors).ok, true)
  const faith = validateFaith({
    faithTitle: "Título",
    faithText: "Linha 1\nLinha 2",
    verseText: "<b>não</b>",
    verseReference: "Cânticos 8:7",
  })
  assert.equal(faith.ok, false)
  const venue = validateEventAndVenue({
    date: "2026-11-14",
    time: "19:00",
    venueName: "Casa Nova",
    venueAddress: "Rua 1",
    venueNeighborhood: "Centro",
    venueCity: "Belém",
    venueState: "PA",
  })
  assert.equal(venue.ok, true)
  if (venue.ok) assert.equal(venue.data.eventTimezone, "America/Belem")
})

test("cms field groups do not overwrite pix", () => {
  const pix = new Set<string>(settingFieldGroups.pix)
  for (const group of ["identity", "heroImage", "theme", "event", "faith"] as const) {
    for (const field of settingFieldGroups[group]) assert.equal(pix.has(field), false)
  }
})

test("share text and maps follow the resolved content", () => {
  const text = invitationShareText("https://kaeale.vercel.app/convite/token-privado", "ABCDEFGHJK", {
    displayName: "Noiva Teste & Noivo Teste",
    dateLabel: "1 de janeiro de 2027",
  })
  assert.equal(text.includes("Noiva Teste & Noivo Teste"), true)
  assert.equal(text.includes("1 de janeiro de 2027"), true)
  assert.equal(text.includes("https://kaeale.vercel.app/convite/token-privado"), true)
  const url = venueMapsUrl({
    name: "Casa Nova",
    address: "Rua 1",
    neighborhood: "Centro",
    city: "Ananindeua",
    state: "PA",
  })
  assert.equal(url.includes("Casa%20Nova"), true)
  assert.equal(url.includes("Ananindeua"), true)
})

test("apimg body contains only the file", () => {
  const body = createApimgFormData(new Blob(["foto"]))
  assert.deepEqual([...body.keys()], ["file"])
})

test("apimg response contract", () => {
  const parsed = parseApimgUploadResponse({
    url: "https://cdn.example/foto.jpg",
    public_id: "foto",
    format: "jpg",
    bytes: 12,
  })
  assert.equal(parsed.ok, true)
  assert.equal(parseApimgUploadResponse({ secure_url: "https://cdn.example/foto.jpg" }).ok, false)
  assert.equal(parseApimgUploadResponse({ url: "http://cdn.example/foto.jpg", public_id: "a", format: "jpg", bytes: 1 }).ok, false)
})

test("image bytes and size are validated", () => {
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0x00])
  const gif = new Uint8Array([0x47, 0x49, 0x46, 0x38])
  assert.equal(inspectImage(jpeg, "image/jpeg", 10).ok, true)
  assert.equal(inspectImage(gif, "image/gif", 10).ok, false)
  assert.equal(inspectImage(jpeg, "image/jpeg", 10 * 1024 * 1024 + 1).ok, false)
  assert.equal(inspectImage(jpeg, "image/png", 10).ok, false)
})
