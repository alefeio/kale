"use client"

import { useState, useTransition } from "react"
import { createInvitation, type AdminActionResult } from "@/actions/admin"
import { CopyInvitation } from "@/components/admin/CopyInvitation"

export function CreateInvitationForm() {
  const [guests, setGuests] = useState([""])
  const [error, setError] = useState("")
  const [result, setResult] = useState<AdminActionResult | null>(null)
  const [pending, startTransition] = useTransition()
  const created =
    result?.ok && result.url && result.code && result.shareText
      ? { url: result.url, code: result.code, shareText: result.shareText }
      : null

  function beginAnotherInvitation() {
    setResult((current) => (current ? null : current))
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const names = guests.map((name) => name.trim()).filter(Boolean)
    setError("")
    startTransition(async () => {
      const response = await createInvitation({
        label: String(form.get("label") ?? ""),
        greeting: String(form.get("greeting") ?? ""),
        guests: names,
      })
      if (!response.ok) {
        setError(response.error ?? "Não foi possível criar o convite.")
        return
      }
      setResult(response)
      setGuests([""])
      formElement.reset()
    })
  }

  return (
    <section className="border border-olive/10 bg-white p-4 sm:p-6">
      <h2 className="font-serif text-3xl text-olive-dark">Novo convite</h2>
      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
        <div>
          <label htmlFor="convite-label" className="mb-2 block text-sm text-brown">
            Identificação do convite
          </label>
          <input id="convite-label" name="label" required className="field" onChange={beginAnotherInvitation} />
        </div>
        <div>
          <label htmlFor="convite-saudacao" className="mb-2 block text-sm text-brown">
            Saudação opcional
          </label>
          <textarea
            id="convite-saudacao"
            name="greeting"
            rows={3}
            className="field min-h-24"
            onChange={beginAnotherInvitation}
          />
        </div>
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 text-sm text-brown">Convidados</legend>
          {guests.map((guest, index) => (
            <label key={index} className="block text-sm text-brown">
              Nome {index + 1}
              <input
                value={guest}
                onChange={(event) => {
                  beginAnotherInvitation()
                  setGuests((current) => current.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))
                }}
                required={index === 0}
                className="field mt-2"
              />
            </label>
          ))}
          <button
            type="button"
            className="btn btn-secondary w-full self-start sm:w-auto"
            onClick={() => setGuests((current) => [...current, ""])}
          >
            Adicionar convidado
          </button>
        </fieldset>
        {error ? (
          <p role="alert" className="text-sm text-olive-dark">
            {error}
          </p>
        ) : null}
        <button type="submit" className="btn btn-primary w-full self-start sm:w-auto" disabled={pending}>
          {pending ? "Salvando..." : "Salvar convite"}
        </button>
      </form>
      {created ? (
        <div className="mt-6 border-t border-olive/15 pt-6" role="status">
          <p className="text-sm text-olive-dark">Convite criado com sucesso.</p>
          <CopyInvitation url={created.url} code={created.code} shareText={created.shareText} />
        </div>
      ) : null}
    </section>
  )
}
