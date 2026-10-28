"use client"

import { useCallback, useLayoutEffect, useState } from "react"
import { RsvpCodeModal } from "@/components/wedding/RsvpCodeModal"
import { RsvpUiContext } from "@/components/wedding/rsvp-ui"
import { WeddingNav } from "@/components/wedding/WeddingNav"

export function HomeShell({ children }: { children: React.ReactNode }) {
  const [codeOpen, setCodeOpen] = useState(false)
  const openCodeModal = useCallback(() => setCodeOpen(true), [])
  const closeCodeModal = useCallback(() => setCodeOpen(false), [])

  useLayoutEffect(() => {
    return () => setCodeOpen(false)
  }, [])

  return (
    <RsvpUiContext.Provider value={{ openCodeModal }}>
      <WeddingNav />
      <main id="conteudo">{children}</main>
      <RsvpCodeModal open={codeOpen} onClose={closeCodeModal} />
    </RsvpUiContext.Provider>
  )
}
