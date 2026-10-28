"use client"

import { useState } from "react"
import { weddingConfig } from "@/config/wedding"
import { PixQr } from "@/components/wedding/PixQr"

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

export function PixSection({
  pix,
}: {
  pix: { key: string; receiver: string; payload: string } | null
}) {
  const { copy } = weddingConfig
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  if (!pix) return null

  async function copyKey() {
    if (!pix) return
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
          <PixQr payload={pix.payload} />
        </div>
        <p className="mt-8 text-sm tracking-[0.14em] text-ivory/70 uppercase">{pix.receiver}</p>
        <p className="mt-2 font-serif text-2xl break-all">{pix.key}</p>
        <button type="button" className="btn btn-light mt-8" onClick={copyKey}>
          {copied ? copy.pixCopied : copy.pixCopy}
        </button>
        {error ? (
          <p role="alert" className="mt-3 text-sm text-ivory">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  )
}
