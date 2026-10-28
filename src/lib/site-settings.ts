import type { CSSProperties } from "react"
import { weddingConfig } from "@/config/wedding"

export const EVENT_TIMEZONE = "America/Belem"
export const HERO_IMAGE_FALLBACK = "/images/casal-hero.jpg"

export const defaultColors = {
  ivory: "#F7F3EA",
  cream: "#EFE7D8",
  primary: "#48563A",
  primaryDark: "#2F3928",
  accent: "#B28A45",
  textMuted: "#6E6252",
  text: "#272A24",
  heroBase: "#5A604C",
} as const

export type WeddingColors = {
  -readonly [Key in keyof typeof defaultColors]: string
}

export type WeddingSettingsRow = {
  brideName: string | null
  groomName: string | null
  heroImageUrl: string | null
  heroImagePublicId: string | null
  heroPositionX: number | null
  heroPositionY: number | null
  heroHeightMobile: number | null
  heroHeightTablet: number | null
  heroHeightDesktop: number | null
  eventAt: Date | null
  eventTimezone: string | null
  faithTitle: string | null
  faithText: string | null
  verseText: string | null
  verseReference: string | null
  venueName: string | null
  venueAddress: string | null
  venueNeighborhood: string | null
  venueCity: string | null
  venueState: string | null
  colorIvory: string | null
  colorCream: string | null
  colorPrimary: string | null
  colorPrimaryDark: string | null
  colorAccent: string | null
  colorTextMuted: string | null
  colorText: string | null
  colorHeroBase: string | null
}

export type ResolvedWeddingSettings = {
  couple: { bride: string; groom: string; displayName: string; monogram: string }
  hero: {
    src: string
    alt: string
    positionX: number
    positionY: number
    heightMobile: number
    heightTablet: number
    heightDesktop: number
  }
  colors: WeddingColors
  event: {
    date: string
    time: string
    isoDate: string
    dateLabel: string
    timeLabel: string
    dottedDate: string
    numericDate: string
    timezone: typeof EVENT_TIMEZONE
    type: string
    calendarDuration: string
  }
  faith: { title: string; text: string; verseText: string; verseReference: string }
  venue: { name: string; address: string; neighborhood: string; city: string; state: string }
}

const months = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
]

export function monogram(bride: string, groom: string) {
  return `${bride.trim().charAt(0).toLocaleUpperCase("pt-BR")}&${groom.trim().charAt(0).toLocaleUpperCase("pt-BR")}`
}

export function belemParts(date: Date) {
  const wall = new Date(date.getTime() - 3 * 60 * 60 * 1000)
  return {
    year: wall.getUTCFullYear(),
    month: wall.getUTCMonth() + 1,
    day: wall.getUTCDate(),
    hour: wall.getUTCHours(),
    minute: wall.getUTCMinutes(),
  }
}

export function eventInstant(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number)
  const [hour, minute] = time.split(":").map(Number)
  return new Date(Date.UTC(year, month - 1, day, hour + 3, minute, 0))
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

export function describeEvent(date: Date): ResolvedWeddingSettings["event"] {
  const parts = belemParts(date)
  const minute = parts.minute === 0 ? "" : pad(parts.minute)
  return {
    date: `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`,
    time: `${pad(parts.hour)}:${pad(parts.minute)}`,
    isoDate: `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}:00-03:00`,
    dateLabel: `${parts.day} de ${months[parts.month - 1]} de ${parts.year}`,
    timeLabel: `${parts.hour}h${minute}`,
    dottedDate: `${pad(parts.day)} • ${pad(parts.month)} • ${parts.year}`,
    numericDate: `${pad(parts.day)}.${pad(parts.month)}.${parts.year}`,
    timezone: EVENT_TIMEZONE,
    type: weddingConfig.ceremony.type,
    calendarDuration: weddingConfig.ceremony.calendarDuration,
  }
}

function fallbackEvent(): ResolvedWeddingSettings["event"] {
  return {
    date: weddingConfig.ceremony.date,
    time: weddingConfig.ceremony.time,
    isoDate: weddingConfig.ceremony.isoDate,
    dateLabel: weddingConfig.ceremony.dateLabel,
    timeLabel: weddingConfig.ceremony.timeLabel,
    dottedDate: weddingConfig.ceremony.dottedDate,
    numericDate: weddingConfig.ceremony.numericDate,
    timezone: EVENT_TIMEZONE,
    type: weddingConfig.ceremony.type,
    calendarDuration: weddingConfig.ceremony.calendarDuration,
  }
}

function color(value: string | null | undefined, fallback: string) {
  return value && /^#[0-9A-Fa-f]{6}$/.test(value) ? value.toUpperCase() : fallback
}

function percent(value: number | null | undefined) {
  return value != null && value >= 0 && value <= 100 ? value : 50
}

function height(value: number | null | undefined) {
  return value != null && value >= 60 && value <= 100 ? value : 100
}

export function resolveWeddingSettings(row: WeddingSettingsRow | null): ResolvedWeddingSettings {
  const bride = row?.brideName?.trim() || weddingConfig.couple.bride
  const groom = row?.groomName?.trim() || weddingConfig.couple.groom
  const event = row?.eventAt ? describeEvent(row.eventAt) : fallbackEvent()

  return {
    couple: {
      bride,
      groom,
      displayName: `${bride} & ${groom}`,
      monogram: monogram(bride, groom),
    },
    hero: {
      src: row?.heroImageUrl?.trim() || HERO_IMAGE_FALLBACK,
      alt: `${bride} e ${groom}`,
      positionX: percent(row?.heroPositionX),
      positionY: percent(row?.heroPositionY),
      heightMobile: height(row?.heroHeightMobile),
      heightTablet: height(row?.heroHeightTablet),
      heightDesktop: height(row?.heroHeightDesktop),
    },
    colors: {
      ivory: color(row?.colorIvory, defaultColors.ivory),
      cream: color(row?.colorCream, defaultColors.cream),
      primary: color(row?.colorPrimary, defaultColors.primary),
      primaryDark: color(row?.colorPrimaryDark, defaultColors.primaryDark),
      accent: color(row?.colorAccent, defaultColors.accent),
      textMuted: color(row?.colorTextMuted, defaultColors.textMuted),
      text: color(row?.colorText, defaultColors.text),
      heroBase: color(row?.colorHeroBase, defaultColors.heroBase),
    },
    event,
    faith: {
      title: row?.faithTitle?.trim() || weddingConfig.copy.faithTitle,
      text: row?.faithText ?? weddingConfig.copy.faithText,
      verseText: row?.verseText?.trim() || weddingConfig.verse.text,
      verseReference: row?.verseReference?.trim() || weddingConfig.verse.reference,
    },
    venue: {
      name: row?.venueName?.trim() || weddingConfig.venue.name,
      address: row?.venueAddress?.trim() || weddingConfig.venue.address,
      neighborhood: row?.venueNeighborhood?.trim() || weddingConfig.venue.neighborhood,
      city: row?.venueCity?.trim() || weddingConfig.venue.city,
      state: row?.venueState?.trim() || weddingConfig.venue.state,
    },
  }
}

export function weddingSiteStyle(site: ResolvedWeddingSettings): CSSProperties {
  const { colors, hero } = site
  return {
    "--ivory": colors.ivory,
    "--cream": colors.cream,
    "--olive": colors.primary,
    "--olive-dark": colors.primaryDark,
    "--gold": colors.accent,
    "--brown": colors.textMuted,
    "--ink": colors.text,
    "--hero-base": colors.heroBase,
    "--background": colors.ivory,
    "--foreground": colors.text,
    "--color-ivory": colors.ivory,
    "--color-cream": colors.cream,
    "--color-olive": colors.primary,
    "--color-olive-dark": colors.primaryDark,
    "--color-gold": colors.accent,
    "--color-brown": colors.textMuted,
    "--color-ink": colors.text,
    "--color-background": colors.ivory,
    "--color-foreground": colors.text,
    "--hero-position": `${hero.positionX}% ${hero.positionY}%`,
    "--hero-height-mobile": `${hero.heightMobile}dvh`,
    "--hero-height-tablet": `${hero.heightTablet}dvh`,
    "--hero-height-desktop": `${hero.heightDesktop}dvh`,
  } as CSSProperties
}

export function metadataTitle(site: ResolvedWeddingSettings) {
  return `${site.couple.displayName} — ${site.event.numericDate}`
}

type Parsed<T> = { ok: true; data: T } | { ok: false; error: string }

function plainText(value: string, label: string, max: number): Parsed<string> {
  const text = value.replace(/\r\n/g, "\n").trim()
  if (!text) return { ok: false, error: `Preencha ${label}.` }
  if (text.length > max) return { ok: false, error: `${label} pode ter no máximo ${max} caracteres.` }
  if (/[<>]/.test(text)) return { ok: false, error: `Não use HTML em ${label}.` }
  return { ok: true, data: text }
}

function integerInRange(value: unknown, min: number, max: number, label: string): Parsed<number> {
  const number = typeof value === "number" ? value : Number(value)
  if (!Number.isInteger(number) || number < min || number > max) {
    return { ok: false, error: `${label} deve ficar entre ${min} e ${max}.` }
  }
  return { ok: true, data: number }
}

const hex = /^#[0-9A-Fa-f]{6}$/

export function normalizeHex(value: string) {
  const colorValue = value.trim()
  if (!hex.test(colorValue)) return { ok: false as const, error: "Informe uma cor no formato #RRGGBB." }
  return { ok: true as const, value: colorValue.toUpperCase() }
}

export function validateIdentityAndHero(input: {
  brideName: string
  groomName: string
  heroPositionX: number
  heroPositionY: number
  heroHeightMobile: number
  heroHeightTablet: number
  heroHeightDesktop: number
}) {
  const bride = plainText(input.brideName, "o nome da noiva", 80)
  if (!bride.ok) return bride
  const groom = plainText(input.groomName, "o nome do noivo", 80)
  if (!groom.ok) return groom
  const positionX = integerInRange(input.heroPositionX, 0, 100, "A posição horizontal")
  if (!positionX.ok) return positionX
  const positionY = integerInRange(input.heroPositionY, 0, 100, "A posição vertical")
  if (!positionY.ok) return positionY
  const mobile = integerInRange(input.heroHeightMobile, 60, 100, "A altura no celular")
  if (!mobile.ok) return mobile
  const tablet = integerInRange(input.heroHeightTablet, 60, 100, "A altura no tablet")
  if (!tablet.ok) return tablet
  const desktop = integerInRange(input.heroHeightDesktop, 60, 100, "A altura no desktop")
  if (!desktop.ok) return desktop
  return {
    ok: true as const,
    data: {
      brideName: bride.data,
      groomName: groom.data,
      heroPositionX: positionX.data,
      heroPositionY: positionY.data,
      heroHeightMobile: mobile.data,
      heroHeightTablet: tablet.data,
      heroHeightDesktop: desktop.data,
    },
  }
}

export function validateTheme(input: WeddingColors) {
  const entries = Object.entries(input) as [keyof WeddingColors, string][]
  const data = {} as WeddingColors
  for (const [key, value] of entries) {
    const parsed = normalizeHex(value)
    if (!parsed.ok) return parsed
    data[key] = parsed.value
  }
  return {
    ok: true as const,
    data: {
      colorIvory: data.ivory,
      colorCream: data.cream,
      colorPrimary: data.primary,
      colorPrimaryDark: data.primaryDark,
      colorAccent: data.accent,
      colorTextMuted: data.textMuted,
      colorText: data.text,
      colorHeroBase: data.heroBase,
    },
  }
}

export function validateEventAndVenue(input: {
  date: string
  time: string
  venueName: string
  venueAddress: string
  venueNeighborhood: string
  venueCity: string
  venueState: string
}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return { ok: false as const, error: "Informe a data do evento." }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time)) return { ok: false as const, error: "Informe a hora do evento." }
  const instant = eventInstant(input.date, input.time)
  const described = describeEvent(instant)
  if (Number.isNaN(instant.getTime()) || described.date !== input.date || described.time !== input.time) {
    return { ok: false as const, error: "Informe a data do evento." }
  }
  const name = plainText(input.venueName, "o nome do local", 120)
  if (!name.ok) return name
  const address = plainText(input.venueAddress, "o endereço", 180)
  if (!address.ok) return address
  const neighborhood = plainText(input.venueNeighborhood, "o bairro", 80)
  if (!neighborhood.ok) return neighborhood
  const city = plainText(input.venueCity, "a cidade", 80)
  if (!city.ok) return city
  const state = plainText(input.venueState, "o estado", 40)
  if (!state.ok) return state
  return {
    ok: true as const,
    data: {
      eventAt: instant,
      eventTimezone: EVENT_TIMEZONE,
      venueName: name.data,
      venueAddress: address.data,
      venueNeighborhood: neighborhood.data,
      venueCity: city.data,
      venueState: state.data,
    },
  }
}

export function validateFaith(input: {
  faithTitle: string
  faithText: string
  verseText: string
  verseReference: string
}) {
  const title = plainText(input.faithTitle, "o título da segunda seção", 120)
  if (!title.ok) return title
  const text = plainText(input.faithText, "o texto da segunda seção", 600)
  if (!text.ok) return text
  const verse = plainText(input.verseText, "o versículo", 500)
  if (!verse.ok) return verse
  const reference = plainText(input.verseReference, "a referência do versículo", 80)
  if (!reference.ok) return reference
  return {
    ok: true as const,
    data: {
      faithTitle: title.data,
      faithText: text.data,
      verseText: verse.data,
      verseReference: reference.data,
    },
  }
}

export const settingFieldGroups = {
  pix: ["pixEnabled", "pixKeyType", "pixKey", "pixReceiver", "pixCity"],
  identity: [
    "brideName",
    "groomName",
    "heroPositionX",
    "heroPositionY",
    "heroHeightMobile",
    "heroHeightTablet",
    "heroHeightDesktop",
  ],
  heroImage: ["heroImageUrl", "heroImagePublicId"],
  theme: [
    "colorIvory",
    "colorCream",
    "colorPrimary",
    "colorPrimaryDark",
    "colorAccent",
    "colorTextMuted",
    "colorText",
    "colorHeroBase",
  ],
  event: [
    "eventAt",
    "eventTimezone",
    "venueName",
    "venueAddress",
    "venueNeighborhood",
    "venueCity",
    "venueState",
  ],
  faith: ["faithTitle", "faithText", "verseText", "verseReference"],
} as const
