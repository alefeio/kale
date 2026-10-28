import type { Metadata } from "next"

export const instant = false

export const metadata: Metadata = {
  robots: "noindex,nofollow",
  title: "Administração",
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children
}
