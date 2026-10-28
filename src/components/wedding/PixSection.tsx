"use client"

import { useState } from "react"
import { weddingConfig } from "@/config/wedding"
import { PixQr } from "@/components/wedding/PixQr"
import { buildPixBrCode } from "@/lib/pix-brcode"

function copyWithSelection(value: string) {
  const field = document.createElement("textarea")
  field.value = value
  field.setAttribute("readonly", "")
  field.style.position = "fixed"
  field.style.left = "-9999px"
  document.body.appendChild(field)
  field.select()
  const copied = document.execCommand("copy")
  field.remove()
  if (!copied) throw new Error("copy")
}

export function PixSection() {
  const { pix, copy } = weddingConfig
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")
  const placeholder = pix.key === pix.placeholderKey
  const visibleKey = placeholder ? copy.pixPendingLabel : pix.key

  if (!pix.enabled) return null

  async function copyKey() {
    if (placeholder) return
    const value = pix.key
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
      } else {
        copyWithSelection(value)
      }
      setCopied(true)
      setError("")
      window.setTimeout(() => setCopied(false), 2400)
    } catch {
      try {
        copyWithSelection(value)
        setCopied(true)
        setError("")
        window.setTimeout(() => setCopied(false), 2400)
      } catch {
        setError("Não foi possível copiar. Selecione a chave manualmente.")
      }
    }
  }

  return (
    <section className="bg-olive-dark px-5 py-20 text-ivory sm:py-28" aria-labelledby="pix-titulo">
      <div className="mx-auto max-w-xl border border-gold/40 px-5 py-10 text-center sm:px-10 sm:py-14">
        <h2 id="pix-titulo" className="font-serif text-4xl leading-tight font-medium sm:text-5xl">
          {copy.pixTitle}
        </h2>
        <p className="mt-5 text-base leading-8 whitespace-pre-line text-ivory/85">{copy.pixText}</p>
        <div className="mt-8">
          <PixQr payload={placeholder ? "demonstrativo" : buildPixBrCode(pix.key, pix.receiver, weddingConfig.venue.city)} />
          <p className="mt-3 text-[0.65rem] tracking-[0.22em] text-ivory/70 uppercase">
            QR Code demonstrativo
          </p>
        </div>
        <p className="mt-8 text-sm tracking-[0.14em] text-ivory/70 uppercase">{pix.receiver}</p>
        <p className="mt-2 font-serif text-2xl break-all">{visibleKey}</p>
        {placeholder ? (
          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-ivory/80">{copy.pixPendingNote}</p>
        ) : null}
        <button
          type="button"
          className="btn btn-light mt-8"
          onClick={copyKey}
          disabled={placeholder}
          aria-describedby={placeholder ? "pix-pendente" : undefined}
        >
          {copied ? copy.pixCopied : copy.pixCopy}
        </button>
        {placeholder ? (
          <span id="pix-pendente" className="sr-only">
            {copy.pixPendingNote}
          </span>
        ) : null}
        {error ? (
          <p role="alert" className="mt-3 text-sm text-ivory">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  )
}
