"use client"

import { createContext, useContext } from "react"

interface RsvpUiContextValue {
  openCodeModal: () => void
}

export const RsvpUiContext = createContext<RsvpUiContextValue | null>(null)

export function useRsvpUi() {
  const value = useContext(RsvpUiContext)
  if (!value) {
    throw new Error("O convite precisa estar dentro da página inicial.")
  }
  return value
}
