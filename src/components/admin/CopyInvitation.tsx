"use client"

import { useState } from "react"

export function CopyInvitation({
  url,
  code,
  shareText,
}: {
  url: string
  code: string
  shareText: string
}) {
  const [notice, setNotice] = useState("")

  async function copy(value: string, message: string) {
    try {
      await navigator.clipboard.writeText(value)
      setNotice(message)
    } catch {
      setNotice("Não foi possível copiar. Selecione o texto manualmente.")
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      <p className="text-sm text-brown">Código: {code}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-secondary" onClick={() => copy(url, "Link copiado.")}>
          Copiar link
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => copy(code, "Código copiado.")}>
          Copiar código
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => copy(shareText, "Convite copiado.")}>
          Copiar convite
        </button>
      </div>
      {notice ? (
        <p role="status" className="text-sm text-olive-dark">
          {notice}
        </p>
      ) : null}
    </div>
  )
}
