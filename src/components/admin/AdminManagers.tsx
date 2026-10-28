"use client"

import { useState, useTransition } from "react"
import { releaseReservation, removeGift, removeMessage, saveGift } from "@/actions/admin"

const categories = [
  { value: "TABLE", label: "Mesa" },
  { value: "KITCHEN", label: "Cozinha" },
  { value: "BATH", label: "Banho" },
  { value: "HOME", label: "Casa" },
  { value: "APPLIANCES", label: "Eletros" },
] as const

type GiftItem = {
  id: string
  name: string
  category: (typeof categories)[number]["value"]
  sortOrder: number
  active: boolean
  reserved: boolean
  description: string
}

export function GiftManager({ gifts }: { gifts: GiftItem[] }) {
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  function finish(response: { ok: boolean; message?: string; error?: string }) {
    if (!response.ok) setError(response.error ?? "Não foi possível salvar.")
    else setMessage(response.message ?? "Presente atualizado.")
  }

  return (
    <div className="flex flex-col gap-8">
      {message ? <p role="status" className="text-sm text-olive-dark">{message}</p> : null}
      {error ? <p role="alert" className="text-sm text-olive-dark">{error}</p> : null}
      <form
        className="grid gap-4 border border-olive/10 bg-white p-4 sm:grid-cols-2 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault()
          const formElement = event.currentTarget
          const form = new FormData(formElement)
          setError("")
          startTransition(async () => {
            const response = await saveGift({
              name: String(form.get("name") ?? ""),
              category: String(form.get("category") ?? ""),
              sortOrder: Number(form.get("sortOrder") ?? 0),
              active: form.get("active") === "on",
              description: String(form.get("description") ?? ""),
            })
            finish(response)
            if (response.ok) formElement.reset()
          })
        }}
      >
        <h2 className="font-serif text-3xl text-olive-dark sm:col-span-2">Novo presente</h2>
        <label className="text-sm text-brown">
          Nome
          <input name="name" required className="field mt-2" />
        </label>
        <label className="text-sm text-brown">
          Categoria
          <select name="category" className="field mt-2" defaultValue="TABLE">
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-brown">
          Ordem
          <input name="sortOrder" type="number" min={0} defaultValue={gifts.length + 1} required className="field mt-2" />
        </label>
        <label className="flex min-h-11 items-center gap-3 self-end text-sm text-brown">
          <input type="checkbox" name="active" defaultChecked />
          Ativo
        </label>
        <button type="submit" className="btn btn-primary sm:col-span-2" disabled={pending}>
          {pending ? "Salvando..." : "Criar presente"}
        </button>
      </form>

      <ul className="flex flex-col gap-4">
        {gifts.map((gift) => (
          <li key={gift.id}>
            <form
              className="grid gap-3 border border-olive/10 bg-white p-4 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault()
                const form = new FormData(event.currentTarget)
                setError("")
                startTransition(async () => {
                  finish(
                    await saveGift(
                      {
                        name: String(form.get("name") ?? ""),
                        category: String(form.get("category") ?? ""),
                        sortOrder: Number(form.get("sortOrder") ?? 0),
                        active: form.get("active") === "on",
                        description: String(form.get("description") ?? ""),
                      },
                      gift.id,
                    ),
                  )
                })
              }}
            >
              <input type="hidden" name="description" defaultValue={gift.description} />
              <label className="text-sm text-brown">
                Nome
                <input name="name" defaultValue={gift.name} required className="field mt-2" />
              </label>
              <label className="text-sm text-brown">
                Categoria
                <select name="category" defaultValue={gift.category} className="field mt-2">
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-brown">
                Ordem
                <input name="sortOrder" type="number" min={0} defaultValue={gift.sortOrder} required className="field mt-2" />
              </label>
              <p className="self-end text-sm text-brown">Status: {gift.reserved ? "Reservado" : "Disponível"}</p>
              <label className="flex min-h-11 items-center gap-3 text-sm text-brown">
                <input type="checkbox" name="active" defaultChecked={gift.active} />
                Ativo
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="submit" className="btn btn-secondary" disabled={pending}>
                  Salvar
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={pending}
                  onClick={() => {
                    if (!window.confirm("Remover este presente?")) return
                    setError("")
                    startTransition(async () => finish(await removeGift(gift.id)))
                  }}
                >
                  Excluir
                </button>
              </div>
            </form>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ReservationManager({
  reservations,
}: {
  reservations: {
    id: string
    gift: string
    donorName: string
    donorContact: string
    invitation: string
    origin: string
    date: string
    message: string
  }[]
}) {
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  if (reservations.length === 0) return <p className="text-brown">Nenhuma reserva realizada.</p>

  return (
    <div>
      {message ? <p role="status" className="mb-4 text-sm text-olive-dark">{message}</p> : null}
      {error ? <p role="alert" className="mb-4 text-sm text-olive-dark">{error}</p> : null}
      <ul className="flex flex-col gap-4">
        {reservations.map((reservation) => (
          <li key={reservation.id} className="border border-olive/10 bg-white p-4">
            <p className="font-serif text-2xl text-olive-dark">{reservation.gift}</p>
            <dl className="mt-3 grid gap-2 text-sm text-brown sm:grid-cols-2">
              <div><dt>Quem reservou</dt><dd>{reservation.donorName}</dd></div>
              <div><dt>WhatsApp</dt><dd>{reservation.donorContact || "—"}</dd></div>
              <div><dt>Convite</dt><dd>{reservation.invitation}</dd></div>
              <div><dt>Origem</dt><dd>{reservation.origin}</dd></div>
              <div><dt>Data</dt><dd>{reservation.date}</dd></div>
              <div className="sm:col-span-2"><dt>Mensagem</dt><dd>{reservation.message || "—"}</dd></div>
            </dl>
            <button
              type="button"
              className="btn btn-secondary mt-4"
              disabled={pending}
              onClick={() => {
                if (!window.confirm("Tem certeza que deseja liberar este presente?\nEle voltará a aparecer como disponível.")) return
                setError("")
                startTransition(async () => {
                  const response = await releaseReservation(reservation.id)
                  if (!response.ok) setError(response.error ?? "Não foi possível liberar.")
                  else setMessage(response.message ?? "Reserva liberada.")
                })
              }}
            >
              Liberar presente
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function MessageManager({
  messages,
}: {
  messages: { id: string; name: string; message: string; date: string }[]
}) {
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  if (messages.length === 0) return <p className="text-brown">Nenhuma mensagem recebida.</p>

  return (
    <div>
      {notice ? <p role="status" className="mb-4 text-sm text-olive-dark">{notice}</p> : null}
      {error ? <p role="alert" className="mb-4 text-sm text-olive-dark">{error}</p> : null}
      <ul className="flex flex-col gap-4">
        {messages.map((item) => (
          <li key={item.id} className="border border-olive/10 bg-white p-4">
            <p className="text-sm text-brown">{item.date}</p>
            <p className="mt-2 font-serif text-2xl text-olive-dark">{item.name}</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-brown">{item.message}</p>
            <button
              type="button"
              className="btn btn-ghost mt-4"
              disabled={pending}
              onClick={() => {
                if (!window.confirm("Excluir esta mensagem?")) return
                setError("")
                startTransition(async () => {
                  const response = await removeMessage(item.id)
                  if (!response.ok) setError(response.error ?? "Não foi possível excluir.")
                  else setNotice(response.message ?? "Mensagem excluída.")
                })
              }}
            >
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
