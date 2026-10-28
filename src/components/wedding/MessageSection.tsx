"use client"

import { useState } from "react"
import { weddingConfig } from "@/config/wedding"
import { messageService } from "@/services/messages"

export function MessageSection() {
  const { copy } = weddingConfig
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<{ name?: string; message?: string }>({})
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)
  const [failure, setFailure] = useState("")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: { name?: string; message?: string } = {}
    if (!name.trim()) nextErrors.name = "Conte seu nome."
    if (!message.trim()) nextErrors.message = "Escreva uma mensagem."
    setErrors(nextErrors)
    setFailure("")
    if (nextErrors.name || nextErrors.message) return

    setPending(true)
    try {
      await messageService.sendMessage({ name, message })
      setSent(true)
      setName("")
      setMessage("")
    } catch {
      setFailure("Não foi possível guardar a mensagem agora.")
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="px-5 py-20 sm:py-28" aria-labelledby="mensagem-titulo">
      <div className="mx-auto max-w-xl">
        <h2
          id="mensagem-titulo"
          className="text-center font-serif text-4xl leading-tight font-medium text-olive-dark sm:text-5xl"
        >
          {copy.messageTitle}
        </h2>
        <p className="mt-5 text-center text-base leading-8 whitespace-pre-line text-brown">
          {copy.messageText}
        </p>

        {sent ? (
          <div className="mt-10 border border-olive/15 px-6 py-10 text-center" role="status">
            <p className="font-serif text-3xl text-olive-dark">{copy.messageSuccessTitle}</p>
            <p className="mt-3 text-brown">{copy.messageSuccessText}</p>
            <button type="button" className="btn btn-secondary mt-8" onClick={() => setSent(false)}>
              Escrever outra mensagem
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-5" noValidate>
            <div>
              <label htmlFor="mensagem-nome" className="mb-2 block text-sm text-brown">
                {copy.messageName}
              </label>
              <input
                id="mensagem-nome"
                name="nome"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                className="field"
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? "mensagem-nome-erro" : undefined}
              />
              {errors.name ? (
                <p id="mensagem-nome-erro" role="alert" className="mt-2 text-sm text-olive-dark">
                  {errors.name}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="mensagem-texto" className="mb-2 block text-sm text-brown">
                {copy.messageBody}
              </label>
              <textarea
                id="mensagem-texto"
                name="mensagem"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={5}
                className="field min-h-36 resize-y"
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={errors.message ? "mensagem-texto-erro" : undefined}
              />
              {errors.message ? (
                <p id="mensagem-texto-erro" role="alert" className="mt-2 text-sm text-olive-dark">
                  {errors.message}
                </p>
              ) : null}
            </div>
            {failure ? (
              <p role="alert" className="text-sm text-olive-dark">
                {failure}
              </p>
            ) : null}
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending ? "Enviando..." : copy.messageSubmit}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
