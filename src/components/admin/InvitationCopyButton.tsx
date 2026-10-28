"use client"

import { useState, useTransition } from "react"
import { copyInvitation } from "@/actions/admin"
import { CopyInvitation } from "@/components/admin/CopyInvitation"

export function InvitationCopyButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [copied, setCopied] = useState<{ url: string; code: string; shareText: string } | null>(null)

  return (
    <div>
      <button
        type="button"
        className="btn btn-secondary"
        disabled={pending}
        onClick={() => {
          setError("")
          startTransition(async () => {
            const response = await copyInvitation(id)
            if (!response.ok || !response.url || !response.code || !response.shareText) {
              setError(response.error ?? "Não foi possível copiar.")
              return
            }
            setCopied({ url: response.url, code: response.code, shareText: response.shareText })
          })
        }}
      >
        Copiar link
      </button>
      {error ? <p role="alert" className="mt-2 text-sm text-olive-dark">{error}</p> : null}
      {copied ? <CopyInvitation url={copied.url} code={copied.code} shareText={copied.shareText} /> : null}
    </div>
  )
}
