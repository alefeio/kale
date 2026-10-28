"use client"

import { useState, useTransition } from "react"
import { saveEventAndVenue, saveFaith, saveIdentityAndHero, saveTheme, uploadHeroImage } from "@/actions/settings"
import { PixSettingsForm } from "@/components/admin/PixSettingsForm"
import { defaultColors, type ResolvedWeddingSettings, type WeddingColors } from "@/lib/site-settings"
import type { WeddingSettingsView } from "@/services/wedding-settings"

const colorFields: { key: keyof WeddingColors; label: string }[] = [
  { key: "ivory", label: "Fundo principal" },
  { key: "cream", label: "Fundo secundário" },
  { key: "primary", label: "Cor principal" },
  { key: "primaryDark", label: "Cor principal escura" },
  { key: "accent", label: "Destaque" },
  { key: "textMuted", label: "Texto secundário" },
  { key: "text", label: "Texto principal" },
  { key: "heroBase", label: "Fundo base do Hero" },
]

export function SettingsScreen({
  site,
  pix,
}: {
  site: ResolvedWeddingSettings
  pix: WeddingSettingsView
}) {
  const [tab, setTab] = useState<"site" | "pix">("site")

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="font-serif text-4xl text-olive-dark sm:text-5xl">Configurações</h1>
      <div role="tablist" aria-label="Configurações" className="flex flex-wrap gap-2">
        <button type="button" role="tab" aria-selected={tab === "site"} className="btn btn-secondary" onClick={() => setTab("site")}>
          Site
        </button>
        <button type="button" role="tab" aria-selected={tab === "pix"} className="btn btn-secondary" onClick={() => setTab("pix")}>
          PIX
        </button>
      </div>
      {tab === "site" ? <SiteSettings site={site} /> : (
        <section className="border border-olive/10 bg-white p-4 sm:p-6">
          <h2 className="font-serif text-3xl text-olive-dark">PIX</h2>
          <div className="mt-5">
            <PixSettingsForm initial={pix} />
          </div>
        </section>
      )}
    </div>
  )
}

function SiteSettings({ site }: { site: ResolvedWeddingSettings }) {
  const [colors, setColors] = useState(site.colors)
  return (
    <div className="flex flex-col gap-6">
      <IdentitySection site={site} colors={colors} />
      <ThemeSection colors={colors} onColors={setColors} />
      <EventSection site={site} />
      <FaithFields site={site} />
    </div>
  )
}

function Feedback({ message, error }: { message: string; error: string }) {
  return (
    <>
      {message ? <p role="status" className="text-sm text-olive-dark">{message}</p> : null}
      {error ? <p role="alert" className="text-sm text-olive-dark">{error}</p> : null}
    </>
  )
}

function IdentitySection({ site, colors }: { site: ResolvedWeddingSettings; colors: WeddingColors }) {
  const [brideName, setBrideName] = useState(site.couple.bride)
  const [groomName, setGroomName] = useState(site.couple.groom)
  const [positionX, setPositionX] = useState(site.hero.positionX)
  const [positionY, setPositionY] = useState(site.hero.positionY)
  const [heightMobile, setHeightMobile] = useState(site.hero.heightMobile)
  const [heightTablet, setHeightTablet] = useState(site.hero.heightTablet)
  const [heightDesktop, setHeightDesktop] = useState(site.hero.heightDesktop)
  const [photo, setPhoto] = useState(site.hero.src)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  function onPhoto(file: File | undefined) {
    if (!file) return
    setError("")
    setMessage("")
    const local = URL.createObjectURL(file)
    setPhoto(local)
    const body = new FormData()
    body.set("file", file)
    startTransition(async () => {
      const response = await uploadHeroImage(body)
      URL.revokeObjectURL(local)
      if (!response.ok) {
        setPhoto(site.hero.src)
        setError(response.error)
        return
      }
      setPhoto(response.url)
      setMessage(response.message)
    })
  }

  return (
    <section className="border border-olive/10 bg-white p-4 sm:p-6">
      <h2 className="font-serif text-3xl text-olive-dark">Identidade</h2>
      <form
        className="mt-5 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          setError("")
          setMessage("")
          startTransition(async () => {
            const response = await saveIdentityAndHero({
              brideName,
              groomName,
              heroPositionX: positionX,
              heroPositionY: positionY,
              heroHeightMobile: heightMobile,
              heroHeightTablet: heightTablet,
              heroHeightDesktop: heightDesktop,
            })
            if (!response.ok) setError(response.error)
            else setMessage(response.message)
          })
        }}
      >
        <label className="text-sm text-brown" htmlFor="bride-name">
          Nome da noiva
          <input id="bride-name" className="field mt-2" value={brideName} maxLength={80} onChange={(event) => setBrideName(event.target.value)} />
        </label>
        <label className="text-sm text-brown" htmlFor="groom-name">
          Nome do noivo
          <input id="groom-name" className="field mt-2" value={groomName} maxLength={80} onChange={(event) => setGroomName(event.target.value)} />
        </label>

        <div>
          <h3 className="font-serif text-2xl text-olive-dark">Hero</h3>
          <p className="mt-3 text-sm text-brown">Foto principal</p>
          <div
            className="relative mt-3 overflow-hidden"
            style={{ height: `${Math.max(heightMobile, 60) * 2.2}px`, background: colors.heroBase }}
          >
            {/* Preview may be a local object URL or an APIMG address. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="Prévia do Hero" className="hero-photo" style={{ objectPosition: `${positionX}% ${positionY}%` }} />
            <div className="hero-tone" />
            <div className="hero-warm" />
            <div className="hero-overlay" />
            <div className="absolute inset-x-0 bottom-4 px-4 text-center">
              <p className="font-script text-4xl break-words" style={{ color: colors.ivory }}>{`${brideName.trim() || "Noiva"} & ${groomName.trim() || "Noivo"}`}</p>
              <p className="mt-1 text-xs tracking-[0.2em] uppercase" style={{ color: colors.ivory }}>{site.event.dottedDate}</p>
            </div>
          </div>
          <label className="btn btn-secondary mt-3 w-full sm:w-auto" htmlFor="hero-photo">
            Alterar foto
            <input
              id="hero-photo"
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => onPhoto(event.target.files?.[0])}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField id="hero-x" label="Posição horizontal" value={positionX} min={0} max={100} onChange={setPositionX} />
          <NumberField id="hero-y" label="Posição vertical" value={positionY} min={0} max={100} onChange={setPositionY} />
          <NumberField id="hero-mobile" label="Celular" value={heightMobile} min={60} max={100} onChange={setHeightMobile} />
          <NumberField id="hero-tablet" label="Tablet" value={heightTablet} min={60} max={100} onChange={setHeightTablet} />
          <NumberField id="hero-desktop" label="Desktop" value={heightDesktop} min={60} max={100} onChange={setHeightDesktop} />
        </div>
        <p className="text-sm text-brown">A altura usa a unidade fixa dvh.</p>
        <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={pending}>Salvar identidade</button>
        <Feedback message={message} error={error} />
      </form>
    </section>
  )
}

function ThemeSection({ colors, onColors }: { colors: WeddingColors; onColors: (colors: WeddingColors) => void }) {
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  function setColor(key: keyof WeddingColors, value: string) {
    onColors({ ...colors, [key]: value })
  }

  return (
    <section className="border border-olive/10 bg-white p-4 sm:p-6">
      <h2 className="font-serif text-3xl text-olive-dark">Cores</h2>
      <form
        className="mt-5 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          setError("")
          setMessage("")
          startTransition(async () => {
            const response = await saveTheme(colors)
            if (!response.ok) setError(response.error)
            else setMessage(response.message)
          })
        }}
      >
        {colorFields.map((field) => (
          <label key={field.key} className="text-sm text-brown" htmlFor={`color-${field.key}`}>
            {field.label}
            <span className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                aria-label={`${field.label} seletor`}
                type="color"
                value={/^#[0-9A-Fa-f]{6}$/.test(colors[field.key]) ? colors[field.key] : "#000000"}
                onChange={(event) => setColor(field.key, event.target.value.toUpperCase())}
              />
              <input
                id={`color-${field.key}`}
                className="field"
                value={colors[field.key]}
                maxLength={7}
                spellCheck={false}
                onChange={(event) => setColor(field.key, event.target.value)}
              />
            </span>
          </label>
        ))}
        <div className="overflow-hidden border border-olive/10" style={{ background: colors.ivory, color: colors.text }}>
          <div className="p-4">
            <p className="font-serif text-3xl" style={{ color: colors.primaryDark }}>Título</p>
            <p className="mt-2" style={{ color: colors.textMuted }}>Texto</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <span className="btn" style={{ background: colors.primary, color: colors.ivory }}>Botão principal</span>
              <span className="btn" style={{ background: colors.cream, color: colors.primaryDark }}>Botão secundário</span>
            </div>
            <p className="mt-4 text-sm" style={{ color: colors.accent }}>Destaque</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" className="btn btn-secondary w-full sm:w-auto" onClick={() => onColors({ ...defaultColors })}>
            Restaurar cores padrão
          </button>
          <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={pending}>Salvar cores</button>
        </div>
        <Feedback message={message} error={error} />
      </form>
    </section>
  )
}

function EventSection({ site }: { site: ResolvedWeddingSettings }) {
  const [date, setDate] = useState(site.event.date)
  const [time, setTime] = useState(site.event.time)
  const [venueName, setVenueName] = useState(site.venue.name)
  const [venueAddress, setVenueAddress] = useState(site.venue.address)
  const [venueNeighborhood, setVenueNeighborhood] = useState(site.venue.neighborhood)
  const [venueCity, setVenueCity] = useState(site.venue.city)
  const [venueState, setVenueState] = useState(site.venue.state)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  return (
    <section className="border border-olive/10 bg-white p-4 sm:p-6">
      <h2 className="font-serif text-3xl text-olive-dark">Evento</h2>
      <form
        className="mt-5 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          setError("")
          setMessage("")
          startTransition(async () => {
            const response = await saveEventAndVenue({
              date,
              time,
              venueName,
              venueAddress,
              venueNeighborhood,
              venueCity,
              venueState,
            })
            if (!response.ok) setError(response.error)
            else setMessage(response.message)
          })
        }}
      >
        <label className="text-sm text-brown" htmlFor="event-date">
          Data do evento
          <input id="event-date" className="field mt-2" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <label className="text-sm text-brown" htmlFor="event-time">
          Hora do evento
          <input id="event-time" className="field mt-2" type="time" value={time} onChange={(event) => setTime(event.target.value)} />
        </label>
        <h3 className="font-serif text-2xl text-olive-dark">Local</h3>
        <TextField id="venue-name" label="Nome do local" value={venueName} onChange={setVenueName} />
        <TextField id="venue-address" label="Endereço" value={venueAddress} onChange={setVenueAddress} />
        <TextField id="venue-neighborhood" label="Bairro" value={venueNeighborhood} onChange={setVenueNeighborhood} />
        <TextField id="venue-city" label="Cidade" value={venueCity} onChange={setVenueCity} />
        <TextField id="venue-state" label="Estado" value={venueState} onChange={setVenueState} />
        <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={pending}>Salvar evento e local</button>
        <Feedback message={message} error={error} />
      </form>
    </section>
  )
}

function FaithFields({ site }: { site: ResolvedWeddingSettings }) {
  const [faithTitle, setFaithTitle] = useState(site.faith.title)
  const [faithText, setFaithText] = useState(site.faith.text)
  const [verseText, setVerseText] = useState(site.faith.verseText)
  const [verseReference, setVerseReference] = useState(site.faith.verseReference)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  return (
    <section className="border border-olive/10 bg-white p-4 sm:p-6">
      <h2 className="font-serif text-3xl text-olive-dark">Segunda seção</h2>
      <form
        className="mt-5 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          setError("")
          setMessage("")
          startTransition(async () => {
            const response = await saveFaith({ faithTitle, faithText, verseText, verseReference })
            if (!response.ok) setError(response.error)
            else setMessage(response.message)
          })
        }}
      >
        <TextField id="faith-title" label="Título" value={faithTitle} onChange={setFaithTitle} maxLength={120} />
        <label className="text-sm text-brown" htmlFor="faith-text">
          Texto
          <textarea id="faith-text" className="field mt-2 min-h-32" value={faithText} maxLength={600} onChange={(event) => setFaithText(event.target.value)} />
        </label>
        <label className="text-sm text-brown" htmlFor="verse-text">
          Versículo
          <textarea id="verse-text" className="field mt-2 min-h-28" value={verseText} maxLength={500} onChange={(event) => setVerseText(event.target.value)} />
        </label>
        <TextField id="verse-reference" label="Referência do versículo" value={verseReference} onChange={setVerseReference} maxLength={80} />
        <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={pending}>Salvar segunda seção</button>
        <Feedback message={message} error={error} />
      </form>
    </section>
  )
}

function TextField({
  id,
  label,
  value,
  onChange,
  maxLength,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  maxLength?: number
}) {
  return (
    <label className="text-sm text-brown" htmlFor={id}>
      {label}
      <input id={id} className="field mt-2" value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function NumberField({
  id,
  label,
  value,
  min,
  max,
  onChange,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <label className="text-sm text-brown" htmlFor={id}>
      {label}
      <input
        id={id}
        className="field mt-2"
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}
