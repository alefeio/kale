import { weddingConfig } from "@/config/wedding"

export function Footer() {
  const { couple, ceremony, copy } = weddingConfig

  return (
    <footer className="border-t border-olive/10 px-5 py-12 text-center">
      <p className="font-script text-3xl text-olive-dark">{couple.displayName}</p>
      <p className="mt-2 text-sm tracking-[0.22em] text-brown">{ceremony.numericDate}</p>
      <p className="mt-6 text-xs text-brown">{copy.footerNote}</p>
    </footer>
  )
}
