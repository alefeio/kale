"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { weddingConfig } from "@/config/wedding"
import { Modal } from "@/components/ui/Modal"

export function RsvpCodeModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const { copy } = weddingConfig

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const entered = code.trim()
    if (!entered) {
      setError(copy.rsvpCodeError)
      return
    }

    setPending(true)
    setError("")
    const response = await fetch("/api/invitations/access", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: code.trim() }),
      cache: "no-store",
    })
    setPending(false)

    if (!response.ok) {
      setError(copy.rsvpCodeError)
      return
    }

    const data = (await response.json()) as { token?: string }
    if (!data.token) {
      setError(copy.rsvpCodeError)
      return
    }

    onClose()
    router.push(`/convite/${encodeURIComponent(data.token)}`)
  }

  return (
    <Modal open={open} title={copy.rsvpModalTitle} onClose={onClose}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="codigo-convite" className="mb-2 block text-sm text-brown">
            {copy.rsvpCodeLabel}
          </label>
          <input
            id="codigo-convite"
            name="codigo"
            value={code}
            onChange={(event) => {
              setCode(event.target.value)
              setError("")
            }}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            className="field"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "codigo-erro" : undefined}
          />
          {error ? (
            <p id="codigo-erro" role="alert" className="mt-2 text-sm text-olive-dark">
              {error}
            </p>
          ) : null}
        </div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Buscando..." : copy.rsvpContinue}
        </button>
      </form>
    </Modal>
  )
}
