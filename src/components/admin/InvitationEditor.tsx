"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import {
  addGuest,
  regenerateInvitationCode,
  regenerateInvitationLink,
  removeGuest,
  renameGuest,
  updateInvitation,
  type AdminActionResult,
} from "@/actions/admin"
import { CopyInvitation } from "@/components/admin/CopyInvitation"

type GuestItem = { id: string; name: string; attending: boolean | null }

export function InvitationEditor({
  invitation,
}: {
  invitation: {
    id: string
    label: string
    greeting: string
    active: boolean
    guests: GuestItem[]
  }
}) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [credentials, setCredentials] = useState<AdminActionResult | null>(null)
  const [pending, startTransition] = useTransition()

  function apply(response: AdminActionResult) {
    if (!response.ok) {
      setError(response.error ?? "Não foi possível concluir.")
      return
    }
    setMessage(response.message ?? "Convite atualizado.")
    if (response.url && response.code && response.shareText) setCredentials(response)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-8">
      <form
        className="flex flex-col gap-4 border border-olive/10 bg-white p-4 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault()
          const form = new FormData(event.currentTarget)
          setError("")
          startTransition(async () => {
            apply(
              await updateInvitation({
                id: invitation.id,
                label: String(form.get("label") ?? ""),
                greeting: String(form.get("greeting") ?? ""),
                active: form.get("active") === "on",
              }),
            )
          })
        }}
      >
        <div>
          <label htmlFor="editar-label" className="mb-2 block text-sm text-brown">
            Identificação do convite
          </label>
          <input id="editar-label" name="label" defaultValue={invitation.label} required className="field" />
        </div>
        <div>
          <label htmlFor="editar-saudacao" className="mb-2 block text-sm text-brown">
            Saudação opcional
          </label>
          <textarea id="editar-saudacao" name="greeting" defaultValue={invitation.greeting} rows={3} className="field min-h-24" />
        </div>
        <label className="flex min-h-11 items-center gap-3 text-sm text-brown">
          <input type="checkbox" name="active" defaultChecked={invitation.active} />
          Convite ativo
        </label>
        {error ? <p role="alert" className="text-sm text-olive-dark">{error}</p> : null}
        {message ? <p role="status" className="text-sm text-olive-dark">{message}</p> : null}
        <button type="submit" className="btn btn-primary self-start" disabled={pending}>
          {pending ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>

      <section className="border border-olive/10 bg-white p-4 sm:p-6">
        <h2 className="font-serif text-3xl text-olive-dark">Convidados</h2>
        <ul className="mt-4 flex flex-col gap-4">
          {invitation.guests.map((guest) => (
            <li key={guest.id} className="flex flex-col gap-2 border-b border-olive/10 pb-4 sm:flex-row sm:items-end">
              <form
                className="flex flex-1 flex-col gap-2 sm:flex-row"
                onSubmit={(event) => {
                  event.preventDefault()
                  const form = new FormData(event.currentTarget)
                  setError("")
                  startTransition(async () => {
                    apply(await renameGuest({ id: guest.id, name: String(form.get("name") ?? "") }))
                  })
                }}
              >
                <label className="flex-1 text-sm text-brown">
                  Nome
                  <input name="name" defaultValue={guest.name} required className="field mt-2" />
                </label>
                <button type="submit" className="btn btn-secondary" disabled={pending}>
                  Salvar nome
                </button>
              </form>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={pending}
                onClick={() => {
                  if (!window.confirm("Remover este convidado?")) return
                  setError("")
                  startTransition(async () => apply(await removeGuest(guest.id)))
                }}
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
        <form
          className="mt-4 flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault()
            const formElement = event.currentTarget
            const form = new FormData(formElement)
            setError("")
            startTransition(async () => {
              const response = await addGuest({ invitationId: invitation.id, name: String(form.get("name") ?? "") })
              apply(response)
              if (response.ok) formElement.reset()
            })
          }}
        >
          <label className="flex-1 text-sm text-brown">
            Novo convidado
            <input name="name" required className="field mt-2" />
          </label>
          <button type="submit" className="btn btn-secondary self-end" disabled={pending}>
            Adicionar
          </button>
        </form>
      </section>

      <section className="border border-olive/10 bg-white p-4 sm:p-6">
        <h2 className="font-serif text-3xl text-olive-dark">Código e link</h2>
        <p className="mt-2 text-sm text-brown">O código ou o link anterior deixará de funcionar.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={pending}
            onClick={() => {
              if (!window.confirm("O código anterior deixará de funcionar.")) return
              setError("")
              startTransition(async () => apply(await regenerateInvitationCode(invitation.id)))
            }}
          >
            Regenerar código
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={pending}
            onClick={() => {
              if (!window.confirm("O link anterior deixará de funcionar.")) return
              setError("")
              startTransition(async () => apply(await regenerateInvitationLink(invitation.id)))
            }}
          >
            Regenerar link
          </button>
        </div>
        {credentials?.url && credentials.code && credentials.shareText ? (
          <CopyInvitation url={credentials.url} code={credentials.code} shareText={credentials.shareText} />
        ) : null}
      </section>
    </div>
  )
}
