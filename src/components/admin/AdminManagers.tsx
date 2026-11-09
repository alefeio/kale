"use client"

import { useEffect, useState, useTransition } from "react"
import {
  releaseReservation,
  removeGift,
  removeGiftCategory,
  removeGiftImage,
  removeMessage,
  saveGift,
  saveGiftCategory,
  uploadGiftImage,
} from "@/actions/admin"
import type { GiftImageSource } from "@/lib/gift-images"

type CategoryOption = {
  id: string
  name: string
  slug: string
  active: boolean
}

type GiftItem = {
  id: string
  slug: string
  name: string
  categoryId: string
  sortOrder: number
  active: boolean
  reserved: boolean
  description: string
  storedImage: string
  displayImage: string
  defaultImage: string
  imageSource: GiftImageSource
}

function imageSourceLabel(source: GiftImageSource) {
  if (source === "custom") return "Imagem personalizada"
  if (source === "default") return "Imagem padrão"
  return "Sem foto"
}

export function GiftManager({
  gifts,
  categories,
}: {
  gifts: GiftItem[]
  categories: CategoryOption[]
}) {
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()
  const [previews, setPreviews] = useState<Record<string, string>>({})
  const [previewSources, setPreviewSources] = useState<Record<string, GiftImageSource>>({})
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [objectUrls, setObjectUrls] = useState<Record<string, string>>({})
  const activeCategories = categories.filter((category) => category.active)
  const selectable = activeCategories.length > 0 ? activeCategories : categories

  useEffect(() => {
    return () => {
      for (const url of Object.values(objectUrls)) URL.revokeObjectURL(url)
    }
  }, [objectUrls])

  function finish(response: { ok: boolean; message?: string; error?: string }) {
    if (!response.ok) setError(response.error ?? "Não foi possível salvar.")
    else setMessage(response.message ?? "Presente atualizado.")
  }

  function onPhoto(gift: GiftItem, file: File | null) {
    if (!file || uploadingId) return
    setUploadingId(gift.id)
    setMessage("")
    setError("")
    const objectUrl = URL.createObjectURL(file)
    setObjectUrls((current) => {
      const previous = current[gift.id]
      if (previous) URL.revokeObjectURL(previous)
      return { ...current, [gift.id]: objectUrl }
    })
    setPreviews((current) => ({ ...current, [gift.id]: objectUrl }))
    setPreviewSources((current) => ({ ...current, [gift.id]: "custom" }))
    const body = new FormData()
    body.set("giftId", gift.id)
    body.set("file", file)
    startTransition(async () => {
      const response = await uploadGiftImage(body)
      setUploadingId(null)
      setObjectUrls((current) => {
        const active = current[gift.id]
        if (active) URL.revokeObjectURL(active)
        const next = { ...current }
        delete next[gift.id]
        return next
      })
      if (!response.ok) {
        setPreviews((current) => ({ ...current, [gift.id]: gift.displayImage }))
        setPreviewSources((current) => ({ ...current, [gift.id]: gift.imageSource }))
        setError(response.error ?? "Não foi possível enviar a imagem.")
        return
      }
      setMessage(response.message ?? "Foto atualizada.")
      if (response.url) {
        setPreviews((current) => ({ ...current, [gift.id]: response.url! }))
        setPreviewSources((current) => ({ ...current, [gift.id]: "custom" }))
      }
    })
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
              categoryId: String(form.get("categoryId") ?? ""),
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
          <select name="categoryId" className="field mt-2" defaultValue={selectable[0]?.id}>
            {selectable.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-brown sm:col-span-2">
          Descrição
          <textarea name="description" rows={3} className="field mt-2" />
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
        {gifts.map((gift) => {
          const preview = previews[gift.id] ?? gift.displayImage
          const source = previewSources[gift.id] ?? gift.imageSource
          return (
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
                          categoryId: String(form.get("categoryId") ?? ""),
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
                <div className="sm:col-span-2">
                  <div className="relative aspect-[4/3] max-w-sm overflow-hidden bg-cream">
                    {preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={preview} alt={gift.name} className="h-full w-full object-cover" />
                    ) : (
                      <p className="flex h-full items-center justify-center text-sm text-brown">Sem foto</p>
                    )}
                    {uploadingId === gift.id ? (
                      <p className="absolute inset-x-0 bottom-0 bg-ink/55 px-3 py-2 text-xs text-ivory">Enviando foto…</p>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-brown">{imageSourceLabel(source)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <label className="btn btn-secondary cursor-pointer">
                      {uploadingId === gift.id ? "Enviando..." : gift.storedImage ? "Substituir foto" : "Enviar foto"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        disabled={pending || uploadingId !== null}
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null
                          event.target.value = ""
                          onPhoto(gift, file)
                        }}
                      />
                    </label>
                    {gift.storedImage ? (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        disabled={pending || uploadingId !== null}
                        onClick={() => {
                          setMessage("")
                          setError("")
                          startTransition(async () => {
                            const response = await removeGiftImage(gift.id)
                            finish(response)
                            if (!response.ok) return
                            const restored = gift.defaultImage
                            setPreviews((current) => ({ ...current, [gift.id]: restored }))
                            setPreviewSources((current) => ({
                              ...current,
                              [gift.id]: restored ? "default" : "none",
                            }))
                          })
                        }}
                      >
                        Remover foto personalizada
                      </button>
                    ) : null}
                  </div>
                </div>
                <label className="text-sm text-brown">
                  Nome
                  <input name="name" defaultValue={gift.name} required className="field mt-2" />
                </label>
                <label className="text-sm text-brown">
                  Categoria
                  <select name="categoryId" defaultValue={gift.categoryId} className="field mt-2">
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                        {category.active ? "" : " (inativa)"}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm text-brown sm:col-span-2">
                  Descrição
                  <textarea name="description" rows={3} defaultValue={gift.description} className="field mt-2" />
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
                    disabled={pending || gift.reserved}
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
          )
        })}
      </ul>
    </div>
  )
}

export function GiftCategoryManager({
  categories,
}: {
  categories: Array<{
    id: string
    name: string
    slug: string
    description: string
    sortOrder: number
    active: boolean
    giftCount: number
  }>
}) {
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  function finish(response: { ok: boolean; message?: string; error?: string }) {
    if (!response.ok) setError(response.error ?? "Não foi possível salvar.")
    else setMessage(response.message ?? "Categoria atualizada.")
  }

  return (
    <div className="flex flex-col gap-8">
      {message ? <p role="status" className="text-sm text-olive-dark">{message}</p> : null}
      {error ? <p role="alert" className="text-sm text-olive-dark">{error}</p> : null}

      <form
        className="grid gap-4 border border-olive/10 bg-white p-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault()
          const formElement = event.currentTarget
          const form = new FormData(formElement)
          setError("")
          startTransition(async () => {
            const response = await saveGiftCategory({
              name: String(form.get("name") ?? ""),
              description: String(form.get("description") ?? ""),
              sortOrder: Number(form.get("sortOrder") ?? 0),
              active: form.get("active") === "on",
            })
            finish(response)
            if (response.ok) formElement.reset()
          })
        }}
      >
        <h2 className="font-serif text-3xl text-olive-dark sm:col-span-2">Nova categoria</h2>
        <label className="text-sm text-brown">
          Nome
          <input name="name" required className="field mt-2" />
        </label>
        <label className="text-sm text-brown">
          Ordem
          <input name="sortOrder" type="number" min={0} defaultValue={categories.length + 1} required className="field mt-2" />
        </label>
        <label className="text-sm text-brown sm:col-span-2">
          Descrição
          <textarea name="description" rows={2} className="field mt-2" />
        </label>
        <label className="flex min-h-11 items-center gap-3 text-sm text-brown">
          <input type="checkbox" name="active" defaultChecked />
          Ativa
        </label>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Salvando..." : "Criar categoria"}
        </button>
      </form>

      <ul className="flex flex-col gap-4">
        {categories.map((category) => (
          <li key={category.id}>
            <form
              className="grid gap-3 border border-olive/10 bg-white p-4 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault()
                const form = new FormData(event.currentTarget)
                setError("")
                startTransition(async () => {
                  finish(
                    await saveGiftCategory(
                      {
                        name: String(form.get("name") ?? ""),
                        description: String(form.get("description") ?? ""),
                        sortOrder: Number(form.get("sortOrder") ?? 0),
                        active: form.get("active") === "on",
                      },
                      category.id,
                    ),
                  )
                })
              }}
            >
              <label className="text-sm text-brown">
                Nome
                <input name="name" defaultValue={category.name} required className="field mt-2" />
              </label>
              <p className="self-end text-sm text-brown">
                Slug: {category.slug} · {category.giftCount} presente{category.giftCount === 1 ? "" : "s"}
              </p>
              <label className="text-sm text-brown sm:col-span-2">
                Descrição
                <textarea name="description" rows={2} defaultValue={category.description} className="field mt-2" />
              </label>
              <label className="text-sm text-brown">
                Ordem
                <input name="sortOrder" type="number" min={0} defaultValue={category.sortOrder} required className="field mt-2" />
              </label>
              <label className="flex min-h-11 items-center gap-3 self-end text-sm text-brown">
                <input type="checkbox" name="active" defaultChecked={category.active} />
                Ativa
              </label>
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <button type="submit" className="btn btn-secondary" disabled={pending}>
                  Salvar
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={pending || category.giftCount > 0}
                  onClick={() => {
                    if (!window.confirm("Excluir esta categoria?")) return
                    setError("")
                    startTransition(async () => finish(await removeGiftCategory(category.id)))
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
