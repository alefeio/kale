"use client"

import { useMemo, useState, useTransition } from "react"
import {
  createAdditionalEventLocation,
  removeAdditionalEventLocation,
  reorderAdditionalEventLocations,
  toggleAdditionalEventLocation,
  updateAdditionalEventLocation,
} from "@/actions/settings"
import {
  describeEvent,
  EVENT_LOCATION_TYPES,
  EVENT_START_MODES,
  eventLocationTypeLabels,
  type EventLocationRow,
  type EventLocationTypeValue,
  type EventStartModeValue,
} from "@/lib/site-settings"

type Draft = {
  type: EventLocationTypeValue
  title: string
  venueName: string
  venueAddress: string
  venueNeighborhood: string
  venueCity: string
  venueState: string
  description: string
  startMode: EventStartModeValue
  date: string
  time: string
  mapsUrl: string
  active: boolean
}

const emptyDraft = (): Draft => ({
  type: "DINNER",
  title: "",
  venueName: "",
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
})

function draftFromRow(row: EventLocationRow): Draft {
  const exact = row.startMode === "EXACT" && row.startsAt ? describeEvent(row.startsAt) : null
  return {
    type: row.type,
    title: row.title,
    venueName: row.venueName,
    venueAddress: row.venueAddress ?? "",
    venueNeighborhood: row.venueNeighborhood ?? "",
    venueCity: row.venueCity,
    venueState: row.venueState,
    description: row.description ?? "",
    startMode: row.startMode,
    date: exact?.date ?? "",
    time: exact?.time ?? "",
    mapsUrl: row.mapsUrl ?? "",
    active: row.active,
  }
}

function Feedback({ message, error }: { message: string; error: string }) {
  return (
    <>
      {message ? <p role="status" className="text-sm text-olive-dark">{message}</p> : null}
      {error ? <p role="alert" className="text-sm text-olive-dark">{error}</p> : null}
    </>
  )
}

function LocationForm({
  draft,
  onChange,
  onSubmit,
  pending,
  submitLabel,
  onCancel,
}: {
  draft: Draft
  onChange: (next: Draft) => void
  onSubmit: () => void
  pending: boolean
  submitLabel: string
  onCancel?: () => void
}) {
  return (
    <form
      className="mt-4 flex flex-col gap-3 border border-olive/10 bg-cream/40 p-4"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <label className="text-sm text-brown">
        Tipo
        <select
          className="field mt-2"
          value={draft.type}
          onChange={(event) => onChange({ ...draft, type: event.target.value as EventLocationTypeValue })}
        >
          {EVENT_LOCATION_TYPES.map((type) => (
            <option key={type} value={type}>
              {eventLocationTypeLabels[type]}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm text-brown">
        Título
        <input className="field mt-2" value={draft.title} maxLength={120} onChange={(event) => onChange({ ...draft, title: event.target.value })} />
      </label>
      <label className="text-sm text-brown">
        Nome do local
        <input className="field mt-2" value={draft.venueName} maxLength={120} onChange={(event) => onChange({ ...draft, venueName: event.target.value })} />
      </label>
      <label className="text-sm text-brown">
        Descrição
        <textarea className="field mt-2 min-h-24" value={draft.description} maxLength={500} onChange={(event) => onChange({ ...draft, description: event.target.value })} />
      </label>
      <label className="text-sm text-brown">
        Endereço
        <input className="field mt-2" value={draft.venueAddress} maxLength={180} onChange={(event) => onChange({ ...draft, venueAddress: event.target.value })} />
      </label>
      <label className="text-sm text-brown">
        Bairro
        <input className="field mt-2" value={draft.venueNeighborhood} maxLength={80} onChange={(event) => onChange({ ...draft, venueNeighborhood: event.target.value })} />
      </label>
      <label className="text-sm text-brown">
        Cidade
        <input className="field mt-2" value={draft.venueCity} maxLength={80} onChange={(event) => onChange({ ...draft, venueCity: event.target.value })} />
      </label>
      <label className="text-sm text-brown">
        Estado
        <input className="field mt-2" value={draft.venueState} maxLength={40} onChange={(event) => onChange({ ...draft, venueState: event.target.value })} />
      </label>
      <label className="text-sm text-brown">
        Modo de horário
        <select
          className="field mt-2"
          value={draft.startMode}
          onChange={(event) => onChange({ ...draft, startMode: event.target.value as EventStartModeValue })}
        >
          {EVENT_START_MODES.map((mode) => (
            <option key={mode} value={mode}>
              {mode === "EXACT" ? "Data e hora exatas" : mode === "AFTER_MAIN" ? "Após a cerimônia" : "Horário não informado"}
            </option>
          ))}
        </select>
      </label>
      {draft.startMode === "EXACT" ? (
        <>
          <label className="text-sm text-brown">
            Data
            <input className="field mt-2" type="date" value={draft.date} onChange={(event) => onChange({ ...draft, date: event.target.value })} />
          </label>
          <label className="text-sm text-brown">
            Hora
            <input className="field mt-2" type="time" value={draft.time} onChange={(event) => onChange({ ...draft, time: event.target.value })} />
          </label>
        </>
      ) : null}
      <label className="text-sm text-brown">
        URL de localização
        <input className="field mt-2" value={draft.mapsUrl} maxLength={500} onChange={(event) => onChange({ ...draft, mapsUrl: event.target.value })} />
      </label>
      <label className="flex items-center gap-2 text-sm text-brown">
        <input type="checkbox" checked={draft.active} onChange={(event) => onChange({ ...draft, active: event.target.checked })} />
        Ativo no site
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Salvando..." : submitLabel}
        </button>
        {onCancel ? (
          <button type="button" className="btn btn-ghost" disabled={pending} onClick={onCancel}>
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  )
}

export function AdditionalLocationsAdmin({ initial }: { initial: EventLocationRow[] }) {
  const items = initial
  const [creating, setCreating] = useState(false)
  const [createDraft, setCreateDraft] = useState(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft())
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()
  const ordered = useMemo(() => items.slice().sort((a, b) => a.sortOrder - b.sortOrder), [items])

  function run(action: () => Promise<{ ok: boolean; error?: string; message?: string }>, onSuccess?: () => void) {
    setError("")
    setMessage("")
    startTransition(async () => {
      const response = await action()
      if (!response.ok) setError(response.error ?? "Não foi possível concluir.")
      else {
        setMessage(response.message ?? "Salvo.")
        onSuccess?.()
      }
    })
  }

  return (
    <div className="mt-8 border-t border-olive/15 pt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="font-serif text-2xl text-olive-dark">Locais adicionais</h3>
          <p className="mt-2 text-sm text-brown">Jantar, recepção e outros momentos com endereço e horário próprios.</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={pending || creating}
          onClick={() => {
            setCreating(true)
            setCreateDraft(emptyDraft())
            setEditingId(null)
          }}
        >
          + Adicionar local
        </button>
      </div>

      {creating ? (
        <LocationForm
          draft={createDraft}
          onChange={setCreateDraft}
          pending={pending}
          submitLabel="Criar local"
          onCancel={() => setCreating(false)}
          onSubmit={() =>
            run(
              () => createAdditionalEventLocation(createDraft),
              () => {
                setCreating(false)
                setCreateDraft(emptyDraft())
                window.location.reload()
              },
            )
          }
        />
      ) : null}

      <ul className="mt-5 flex flex-col gap-4">
        {ordered.length === 0 ? <li className="text-sm text-brown">Nenhum local adicional cadastrado.</li> : null}
        {ordered.map((item, index) => (
          <li key={item.id} className="border border-olive/10 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[0.68rem] tracking-[0.18em] text-brown uppercase">{eventLocationTypeLabels[item.type]}</p>
                <p className="mt-1 font-serif text-2xl text-olive-dark">{item.title}</p>
                <p className="mt-1 text-sm text-brown">{item.venueName}</p>
                <p className="mt-1 text-sm text-brown">{item.active ? "Ativo" : "Desativado"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={pending || index === 0}
                  onClick={() => {
                    const ids = ordered.map((row) => row.id)
                    ;[ids[index - 1], ids[index]] = [ids[index], ids[index - 1]]
                    run(() => reorderAdditionalEventLocations(ids), () => window.location.reload())
                  }}
                >
                  Subir
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={pending || index === ordered.length - 1}
                  onClick={() => {
                    const ids = ordered.map((row) => row.id)
                    ;[ids[index + 1], ids[index]] = [ids[index], ids[index + 1]]
                    run(() => reorderAdditionalEventLocations(ids), () => window.location.reload())
                  }}
                >
                  Descer
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={pending}
                  onClick={() =>
                    run(() => toggleAdditionalEventLocation(item.id, !item.active), () => window.location.reload())
                  }
                >
                  {item.active ? "Desativar" : "Ativar"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={pending}
                  onClick={() => {
                    setEditingId(item.id)
                    setEditDraft(draftFromRow(item))
                    setCreating(false)
                  }}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={pending}
                  onClick={() => {
                    if (!window.confirm(`Excluir o local “${item.title}”?`)) return
                    run(() => removeAdditionalEventLocation(item.id), () => window.location.reload())
                  }}
                >
                  Excluir
                </button>
              </div>
            </div>
            {editingId === item.id ? (
              <LocationForm
                draft={editDraft}
                onChange={setEditDraft}
                pending={pending}
                submitLabel="Salvar local"
                onCancel={() => setEditingId(null)}
                onSubmit={() =>
                  run(
                    () => updateAdditionalEventLocation(item.id, { ...editDraft, sortOrder: item.sortOrder }),
                    () => {
                      setEditingId(null)
                      window.location.reload()
                    },
                  )
                }
              />
            ) : null}
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <Feedback message={message} error={error} />
      </div>
    </div>
  )
}
