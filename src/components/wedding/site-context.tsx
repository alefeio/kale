"use client"

import { createContext, useContext } from "react"
import type { ResolvedWeddingSettings } from "@/lib/site-settings"

const SiteContext = createContext<ResolvedWeddingSettings | null>(null)

export function SiteProvider({
  site,
  children,
}: {
  site: ResolvedWeddingSettings
  children: React.ReactNode
}) {
  return <SiteContext.Provider value={site}>{children}</SiteContext.Provider>
}

export function useOptionalSite() {
  return useContext(SiteContext)
}
