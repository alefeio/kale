import type { Metadata } from "next"
import { weddingConfig } from "@/config/wedding"

export const metadata: Metadata = {
  title: {
    absolute: `Convite — ${weddingConfig.couple.displayName}`,
  },
  robots: "noindex,nofollow",
}

export default function ConviteLayout({ children }: { children: React.ReactNode }) {
  return <div className="relative min-h-[100dvh] overflow-hidden">{children}</div>
}
